import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

//Contact type declaration
type Contact = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
  return emailRegex.test(email);
};

// API function to add a contact
const addContact = async (newContact: Contact) => {
  const response = await fetch('http://localhost:5000/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newContact),
  });

  if (!response.ok) {
    throw new Error('Failed to add contact');
  }

  return response.json();
};

const CreateContact: React.FC = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSuccessMessage('Contact added successfully!');
    },
  });

  const [formData, setFormData] = useState<Contact>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    } else {
      setEmailError(null);
    }
    mutation.mutate(formData);
    setFormData({ firstName: '', lastName: '', email: '' }); // Reset form
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>
        <button
          type="submit"
          className="w-full text-white py-2 rounded hover:bg-blue-600 transition bg-blue-800"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Adding...' : 'Add Contact'}
        </button>
      </form>

      {/* Success Message */}
      {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
    </div>
  );
};

export default CreateContact;
