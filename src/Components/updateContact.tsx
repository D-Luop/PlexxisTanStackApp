import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';

//Contact type declaration
type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

//Check validity of email
const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email regex
  return emailRegex.test(email);
};

// Fetch all contacts for the dropdown
const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch('http://localhost:5000/contacts');
  if (!response.ok) throw new Error('Failed to fetch contacts');
  return response.json();
};

// Update contact in the API
const updateContact = async (contact: Contact): Promise<Contact> => {
  const response = await fetch(`http://localhost:5000/contacts/${contact.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contact),
  });
  if (!response.ok) throw new Error('Failed to update contact');
  return response.json();
};

const UpdateContact: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading: isContactsLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Contact | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  //Handle page changes on successful update
  const mutation = useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSuccessMessage('Contact updated successfully!');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && !isValidEmail(formData.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    } else {
      setEmailError(null);
    }
    if (formData) mutation.mutate(formData);
  };

  useEffect(() => {
    setEmailError(null);
    setSuccessMessage(null);
    const fetchContactById = async (id: number) => {
      const response = await fetch(`http://localhost:5000/contacts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      return response.json();
    };

    if (selectedId) {
      fetchContactById(selectedId).then(setFormData);
    }
  }, [selectedId]);

  return (
    <div className="max-w-md mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Update Contact</h2>

      {/* Dropdown */}
      {isContactsLoading ? (
        <p>Loading contacts...</p>
      ) : (
        <select
          className="w-full p-2 border rounded focus:ring-2 text-black"
          value={selectedId || ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
        >
          <option value="" disabled>Select Contact</option>
          {contacts?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} | {c.firstName} {c.lastName}
            </option>
          ))}
        </select>
      )}

      {/* Update Form */}
      {formData && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black" type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 text-black"type="text" name="email" value={formData.email} onChange={handleChange} />
          </div>
          {emailError && <p className="text-red-500">{emailError}</p>}
          <button
            type="submit"
            className="w-full text-white py-2 rounded hover:bg-blue-600 transition bg-blue-800"
          >
            {mutation.isPending ? 'Updating...' : 'Update Contact'}
          </button>
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </form>
      )}
    </div>
  );
};

export default UpdateContact;
