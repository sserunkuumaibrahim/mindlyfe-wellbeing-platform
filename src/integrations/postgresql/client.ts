// PostgreSQL Client for MindLyfe
// This replaces the Supabase client with a custom API client

import { Database } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
  code?: string;
  details?: Record<string, any>;
}

interface AuthUser {
  id: string;
  email: string;
  email_confirmed: boolean;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  role: string;
  last_login_at?: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: AuthUser;
}

class PostgreSQLClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: AuthUser | null = null;
  private tokenExpiresAt: number = 0;
  private refreshInProgress: boolean = false;
  private refreshPromise: Promise<ApiResponse<AuthSession>> | null = null;
  private lastRefreshAttempt: number = 0; // Add rate limiting

  constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
    const userStr = localStorage.getItem("user");
    const expiresAtStr = localStorage.getItem("expires_at");

    if (expiresAtStr) {
      try {
        this.tokenExpiresAt = parseInt(expiresAtStr, 10);
      } catch (e) {
        console.error("Failed to parse expires_at from localStorage:", e);
        this.tokenExpiresAt = 0;
      }
    }

    if (userStr) {
      try {
        this.user = JSON.parse(userStr);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
      }
    }

    // Check if token is expired and clear if needed
    if (this.tokenExpiresAt && this.tokenExpiresAt < Date.now()) {
      console.log("Token expired, clearing from storage");
      this.clearTokensFromStorage();
    }
  }

  private saveTokensToStorage(session: AuthSession) {
    if (!session) {
      console.warn('No session data provided to saveTokensToStorage');
      return;
    }

    localStorage.setItem("access_token", session.access_token);
    localStorage.setItem("refresh_token", session.refresh_token);
    
    // Handle expires_at safely - it might be a number or undefined
    const expiresAt = session.expires_at || (Date.now() + 15 * 60 * 1000); // Default to 15 minutes
    localStorage.setItem("expires_at", expiresAt.toString());
    
    if (session.user) {
      localStorage.setItem("user", JSON.stringify(session.user));
      this.user = session.user;
    }
    
    this.accessToken = session.access_token;
    this.refreshToken = session.refresh_token;
    this.tokenExpiresAt = expiresAt;
  }

  private clearTokensFromStorage() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("user");
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = 0;
    this.user = null;
    this.lastRefreshAttempt = 0; // Reset rate limiting
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    // Check if token is about to expire (within 2 minutes) and refresh if needed
    const now = Date.now();
    if (
      this.accessToken &&
      this.tokenExpiresAt &&
      this.tokenExpiresAt - now < 120000 && // 2 minutes instead of 30 seconds
      !this.refreshInProgress && // Don't trigger if refresh is already in progress
      now - this.lastRefreshAttempt > 30000 // Rate limit: don't refresh more than once every 30 seconds
    ) {
      console.log("Token about to expire, refreshing...", {
        expiresAt: new Date(this.tokenExpiresAt),
        currentTime: new Date(),
        timeDiff: this.tokenExpiresAt - now,
        lastRefreshAttempt: this.lastRefreshAttempt ? new Date(this.lastRefreshAttempt) : "never"
      });
      this.lastRefreshAttempt = now;
      await this.refreshAccessToken();
    }

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { message: text };
        }
      }

      if (!response.ok) {
        // Handle token refresh if needed
        if (
          response.status === 401 &&
          this.refreshToken &&
          !endpoint.includes("/auth/refresh")
        ) {
          console.log("Unauthorized, attempting token refresh...");
          const refreshResult = await this.refreshAccessToken();
          if (refreshResult.data) {
            // Retry the original request with new token
            headers.Authorization = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(url, {
              ...options,
              headers,
            });

            let retryData;
            if (
              retryResponse.headers
                .get("content-type")
                ?.includes("application/json")
            ) {
              retryData = await retryResponse.json();
            } else {
              const text = await retryResponse.text();
              try {
                retryData = JSON.parse(text);
              } catch (e) {
                retryData = { message: text };
              }
            }

            return {
              data: retryResponse.ok ? retryData : null,
              error: retryResponse.ok
                ? null
                : retryData.message || "Request failed",
              code: retryData.code,
              details: retryData.details,
              status: retryResponse.status,
            };
          }
        }

        return {
          data: null,
          error: data.message || "Request failed",
          code: data.code,
          details: data.details,
          status: response.status,
        };
      }

      return {
        data,
        error: null,
        status: response.status,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }

  // Authentication methods
  async signUp(
    email: string,
    password: string,
    role: string,
    userData?: Record<string, unknown>
  ): Promise<ApiResponse<AuthSession>> {
    try {
      // Create a structured request body
      const requestBody: Record<string, any> = {
        email,
        password,
        role,
      };
      
      // Add basic user data if available
      if (userData) {
        // Add standard profile fields
        const standardFields = [
          'first_name', 'last_name', 'phone_number', 'date_of_birth', 
          'gender', 'country', 'preferred_language'
        ];
        
        standardFields.forEach(field => {
          if (userData[field] !== undefined) {
            requestBody[field] = userData[field];
          }
        });
        
        // Handle role-specific data
        if (role === 'individual') {
          // Add individual-specific fields
          const individualFields = [
            'mental_health_history', 'therapy_goals', 'communication_pref',
            'opt_in_newsletter', 'opt_in_sms', 'emergency_contact_name',
            'emergency_contact_phone', 'preferred_therapist_gender'
          ];
          
          individualFields.forEach(field => {
            if (userData[field] !== undefined) {
              requestBody[field] = userData[field];
            }
          });
        } 
        else if (role === 'therapist') {
          // Add therapist-specific fields
          const therapistFields = [
            'national_id_number', 'license_body', 'license_number',
            'license_expiry_date', 'insurance_provider', 'insurance_policy_number',
            'insurance_expiry_date', 'years_experience', 'specializations',
            'languages_spoken', 'education_background', 'certifications', 'bio'
          ];
          
          therapistFields.forEach(field => {
            if (userData[field] !== undefined) {
              requestBody[field] = userData[field];
            }
          });
          
          // Handle document data
          if (userData.documents) {
            requestBody.documents = userData.documents;
          }
        } 
        else if (role === 'org_admin') {
          // Add organization-specific fields
          const orgFields = [
            'organization_name', 'organization_type', 'registration_number',
            'date_of_establishment', 'tax_id_number', 'num_employees',
            'official_website', 'address', 'city', 'state_province',
            'postal_code', 'representative_job_title', 'representative_national_id',
            'service_requirements', 'billing_contact_email', 'billing_contact_phone'
          ];
          
          orgFields.forEach(field => {
            if (userData[field] !== undefined) {
              requestBody[field] = userData[field];
            }
          });
        }
      }

      console.log('Sending registration data to server:', {
        ...requestBody,
        password: '[REDACTED]',
        documents: requestBody.documents ? '[DOCUMENT DATA REDACTED]' : undefined
      });

      const result = await this.makeRequest<AuthSession>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      if (result.data) {
        this.saveTokensToStorage(result.data);
      } else if (result.error) {
        console.error('Registration error:', result.error, result.code, result.details);
      }

      return result;
    } catch (error) {
      console.error('Error in signUp method:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Registration failed',
        status: 0
      };
    }
  }

  async signIn(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthSession>> {
    const result = await this.makeRequest<AuthSession>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (result.data) {
      this.saveTokensToStorage(result.data);
    }

    return result;
  }

  async signOut(): Promise<ApiResponse<void>> {
    let result;

    if (this.accessToken) {
      result = await this.makeRequest<void>("/auth/signout", {
        method: "POST",
      });
    } else {
      result = {
        data: null,
        error: null,
        status: 200,
      };
    }

    this.clearTokensFromStorage();
    return result;
  }

  getCurrentSession(): AuthSession | null {
    if (this.accessToken && this.user && this.tokenExpiresAt > Date.now()) {
      return {
        access_token: this.accessToken,
        refresh_token: this.refreshToken || "",
        expires_at: this.tokenExpiresAt,
        user: this.user,
      };
    }
    return null;
  }

  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  async refreshAccessToken(): Promise<ApiResponse<AuthSession>> {
    // If a refresh is already in progress, return the existing promise
    if (this.refreshInProgress && this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      return {
        data: null,
        error: "No refresh token available",
        status: 401,
      };
    }

    // Set refresh in progress flag and create a new promise
    this.refreshInProgress = true;

    this.refreshPromise = (async () => {
      try {
        console.log("Starting token refresh...", {
          currentToken: this.accessToken?.substring(0, 10) + "...",
          refreshToken: this.refreshToken?.substring(0, 10) + "...",
          expiresAt: new Date(this.tokenExpiresAt)
        });
        
        const result = await this.makeRequest<AuthSession>("/auth/refresh", {
          method: "POST",
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        if (result.data) {
          console.log("Token refresh successful", {
            newExpiresAt: new Date(result.data.expires_at),
            currentTime: new Date()
          });
          this.saveTokensToStorage(result.data);
        } else {
          console.log("Token refresh failed:", result.error);
          this.clearTokensFromStorage();
        }

        return result;
      } finally {
        // Clear the refresh in progress flag
        this.refreshInProgress = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async resetPassword(
    email: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPasswordComplete(
    token: string,
    new_password: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(
      "/auth/reset-password-complete",
      {
        method: "POST",
        body: JSON.stringify({ token, new_password }),
      }
    );
  }

  async confirmEmail(token: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>("/auth/confirm-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // Database query methods
  from(table: keyof Database["public"]["Tables"]) {
    return new QueryBuilder(table, this);
  }

  // RPC method for calling stored procedures
  async rpc(
    functionName: string,
    params?: Record<string, unknown>
  ): Promise<ApiResponse<unknown>> {
    return this.makeRequest(`/rpc/${functionName}`, {
      method: "POST",
      body: JSON.stringify(params || {}),
    });
  }

  // Get current user
  getUser(): AuthUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return (
      !!this.accessToken && !!this.user && this.tokenExpiresAt > Date.now()
    );
  }

  // Analytics methods
  async trackEvent(
    eventName: string,
    properties?: Record<string, unknown>
  ): Promise<ApiResponse<void>> {
    return this.makeRequest<void>("/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        event_name: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
      }),
    });
  }

  async getAnalytics(daysBack: number = 30): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>(`/analytics/events?days_back=${daysBack}`);
  }

  // Profile methods
  async getProfile(): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>("/profiles");
  }

  async updateProfile(
    data: Record<string, unknown>
  ): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>("/profiles", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async completeProfile(
    data: Record<string, unknown>
  ): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>("/profiles/complete", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Document methods
  async uploadDocument(
    document_type: string,
    file_name: string,
    file_path: string,
    mime_type: string = "application/pdf"
  ): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>("/documents/upload", {
      method: "POST",
      body: JSON.stringify({
        document_type,
        file_name,
        file_path,
        mime_type,
      }),
    });
  }

  async getDocuments(): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>("/documents");
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<unknown>> {
    return this.makeRequest<unknown>(`/documents/${documentId}`, {
      method: "DELETE",
    });
  }
}

class QueryBuilder {
  private table: string;
  private client: PostgreSQLClient;
  private selectFields: string[] = ["*"];
  private whereConditions: Array<{
    column: string;
    operator: string;
    value: unknown;
  }> = [];
  private orderByFields: string[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private joinTables: Array<{
    table: string;
    on: string;
    type: "inner" | "left" | "right" | "full";
  }> = [];

  constructor(table: string, client: PostgreSQLClient) {
    this.table = table;
    this.client = client;
  }

  select(fields: string | string[] = "*"): QueryBuilder {
    if (typeof fields === "string") {
      this.selectFields = fields === "*" ? ["*"] : [fields];
    } else {
      this.selectFields = fields;
    }
    return this;
  }

  eq(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "eq", value });
    }
    return this;
  }

  neq(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "neq", value });
    }
    return this;
  }

  gt(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "gt", value });
    }
    return this;
  }

  gte(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "gte", value });
    }
    return this;
  }

  lt(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "lt", value });
    }
    return this;
  }

  lte(column: string, value: unknown): QueryBuilder {
    if (value !== undefined && value !== null) {
      this.whereConditions.push({ column, operator: "lte", value });
    }
    return this;
  }

  like(column: string, value: string): QueryBuilder {
    if (value !== undefined && value !== null && value.trim() !== "") {
      this.whereConditions.push({ column, operator: "like", value });
    }
    return this;
  }

  in(column: string, values: unknown[]): QueryBuilder {
    if (values && Array.isArray(values) && values.length > 0) {
      this.whereConditions.push({ column, operator: "in", value: values });
    }
    return this;
  }

  join(
    table: string,
    on: string,
    type: "inner" | "left" | "right" | "full" = "inner"
  ): QueryBuilder {
    this.joinTables.push({ table, on, type });
    return this;
  }

  order(column: string, ascending: boolean = true): QueryBuilder {
    this.orderByFields.push(`${column}:${ascending ? "asc" : "desc"}`);
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitValue = count;
    return this;
  }

  offset(count: number): QueryBuilder {
    this.offsetValue = count;
    return this;
  }

  async execute<T = unknown[]>(): Promise<ApiResponse<T>> {
    try {
      const queryParams = new URLSearchParams();

      if (this.selectFields.length > 0 && this.selectFields[0] !== "*") {
        queryParams.append("select", this.selectFields.join(","));
      }

      this.whereConditions.forEach((condition, index) => {
        queryParams.append(`where[${index}]`, JSON.stringify(condition));
      });

      if (this.joinTables.length > 0) {
        queryParams.append("join", JSON.stringify(this.joinTables));
      }

      if (this.orderByFields.length > 0) {
        queryParams.append("order", this.orderByFields.join(","));
      }

      if (this.limitValue !== undefined) {
        queryParams.append("limit", this.limitValue.toString());
      }

      if (this.offsetValue !== undefined) {
        queryParams.append("offset", this.offsetValue.toString());
      }

      return this.client["makeRequest"]<T>(
        `/tables/${this.table}?${queryParams.toString()}`
      );
    } catch (error) {
      console.error(`Error executing query on table ${this.table}:`, error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Query execution failed",
        status: 0,
      };
    }
  }

  async single<T = unknown>(): Promise<ApiResponse<T>> {
    try {
      // Set limit to 1 to ensure we only get one record
      this.limit(1);

      const result = await this.execute<T[]>();

      if (result.error) {
        return {
          data: null,
          error: result.error,
          code: result.code,
          details: result.details,
          status: result.status,
        };
      }

      if (Array.isArray(result.data) && result.data.length > 0) {
        return {
          data: result.data[0] as unknown as T,
          error: null,
          status: result.status,
        };
      }

      return {
        data: null,
        error: "No records found",
        status: 404,
      };
    } catch (error) {
      console.error(
        `Error executing single query on table ${this.table}:`,
        error
      );
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Query execution failed",
        status: 0,
      };
    }
  }

  async insert<T = unknown>(
    data: unknown | unknown[]
  ): Promise<ApiResponse<T>> {
    try {
      return this.client["makeRequest"]<T>(`/tables/${this.table}`, {
        method: "POST",
        body: JSON.stringify(Array.isArray(data) ? data : [data]),
      });
    } catch (error) {
      console.error(`Error inserting into table ${this.table}:`, error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Insert operation failed",
        status: 0,
      };
    }
  }

  async update<T = unknown>(data: unknown): Promise<ApiResponse<T>> {
    try {
      if (this.whereConditions.length === 0) {
        throw new Error("WHERE conditions required for update operation");
      }

      const queryParams = new URLSearchParams();

      this.whereConditions.forEach((condition, index) => {
        queryParams.append(`where[${index}]`, JSON.stringify(condition));
      });

      return this.client["makeRequest"]<T>(
        `/tables/${this.table}?${queryParams.toString()}`,
        {
          method: "PATCH",
          body: JSON.stringify(data),
        }
      );
    } catch (error) {
      console.error(`Error updating table ${this.table}:`, error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Update operation failed",
        status: 0,
      };
    }
  }

  async delete<T = unknown>(): Promise<ApiResponse<T>> {
    try {
      if (this.whereConditions.length === 0) {
        throw new Error("WHERE conditions required for delete operation");
      }

      const queryParams = new URLSearchParams();

      this.whereConditions.forEach((condition, index) => {
        queryParams.append(`where[${index}]`, JSON.stringify(condition));
      });

      return this.client["makeRequest"]<T>(
        `/tables/${this.table}?${queryParams.toString()}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error(`Error deleting from table ${this.table}:`, error);
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Delete operation failed",
        status: 0,
      };
    }
  }
}

// Create and export the client instance
export const postgresClient = new PostgreSQLClient();

// Export with alias for compatibility
export const postgresqlClient = postgresClient;

// Export types for compatibility
export type { AuthUser, AuthSession, ApiResponse };
