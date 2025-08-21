import React from 'react';

function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Sign In</button>
      </form>
    </div>
  );
}

export default LoginPage;


