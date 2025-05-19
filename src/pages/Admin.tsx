
export default function AdminPage() {
  return (
    <div className="p-10">
      <h1 className="font-dmsans font-extrabold text-3xl mb-3 text-blue-700">Admin Dashboard</h1>
      <div className="rounded-xl bg-white/70 p-6 shadow">
        <ul className="list-disc pl-5 text-[17px] font-dmsans text-gray-700">
          <li>User/account management, roles, security</li>
          <li>Content/program management, analytics</li>
          <li>Integration setup, backup, compliance reports</li>
        </ul>
      </div>
    </div>
  );
}
