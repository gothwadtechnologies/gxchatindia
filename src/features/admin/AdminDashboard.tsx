import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">GxChat India Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-zinc-100 rounded-xl">
          <h3 className="text-zinc-500 text-sm font-semibold uppercase">Total Users</h3>
          <p className="text-3xl font-bold">12,458</p>
        </div>
        <div className="p-6 bg-zinc-100 rounded-xl">
          <h3 className="text-zinc-500 text-sm font-semibold uppercase">Active Posts</h3>
          <p className="text-3xl font-bold">45,210</p>
        </div>
        <div className="p-6 bg-zinc-100 rounded-xl">
          <h3 className="text-zinc-500 text-sm font-semibold uppercase">Reports</h3>
          <p className="text-3xl font-bold text-red-500">24</p>
        </div>
      </div>
    </div>
  );
}
