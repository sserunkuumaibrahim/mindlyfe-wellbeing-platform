
import React from "react";
import AppSidebar from "@/components/layout/AppSidebar";
const posts = [
  { user: "Anna", content: "Meditation helped me sleep better.", group: "Sleep Support" },
  { user: "Liam", content: "Feeling anxious about exams, tips?", group: "Anxiety Group" },
];
export default function CommunityPage() {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 p-10">
        <h1 className="font-extrabold text-3xl mb-3 text-blue-700">Community Support</h1>
        <div className="rounded-xl bg-white/80 p-6 shadow">
          <h2 className="font-bold mb-2">Support Groups</h2>
          <ul className="list-disc pl-5 text-[17px]">
            <li>Sleep Support</li>
            <li>Anxiety Group</li>
            <li>Student Wellness</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white/70 p-6 shadow mt-5">
          <h2 className="font-bold mb-2">Latest Posts</h2>
          <ul>
            {posts.map((post, i) => (
              <li key={i} className="mb-2 border-b pb-2">
                <span className="font-bold">{post.user}:</span> {post.content}
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 rounded px-2">{post.group}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
