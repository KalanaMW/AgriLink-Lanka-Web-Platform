import React, { useState } from 'react';
import axios from 'axios';

function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'farmer',
    address: { city: '', district: '' },
  });
  const [message, setMessage] = useState('');

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'district') {
      setForm((f) => ({ ...f, address: { ...f.address, [name]: value } }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post('/api/auth/register', form);
      setMessage(res.data?.message || 'Registered');
    } catch (err) {
      setMessage(err?.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-semibold mb-4">Create Account</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" value={form.firstName} onChange={onChange} placeholder="First name" className="mt-1 block w-full border-gray-300 rounded-md" />
            <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Last name" className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" value={form.email} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input type="password" name="password" value={form.password} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select name="role" value={form.role} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md">
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input name="city" value={form.address.city} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">District</label>
            <input name="district" value={form.address.district} onChange={onChange} className="mt-1 block w-full border-gray-300 rounded-md" />
          </div>
        </div>
        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md">Sign Up</button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;


