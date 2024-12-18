import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

//Contact type declaration
type Contact = {
  id: number;
  firstName: string;
  lastName: string;
}

// Fetch all contacts for the dropdown
const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch('http://localhost:5000/contacts');
  if (!response.ok) throw new Error('Failed to fetch contacts');
  return response.json();
};

// Delete a contact by ID
const deleteContact = async (id: number) => {
  const response = await fetch(`http://localhost:5000/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete contact');
  return response.json();
};

const DeleteContact: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: contacts, isLoading: isContactsLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mutation for deleting a contact
  const mutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setSuccessMessage('Contact deleted successfully!');
      setErrorMessage(null);
      setSelectedId(null); // Clear selection
    },
    onError: (error) => {
      setSuccessMessage(null);
      setErrorMessage(error.message || 'Failed to delete contact');
    },
  });

  // Handle dropdown change and clear previous messages
  const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(Number(e.target.value));
    setSuccessMessage(null); // Clear success message
    setErrorMessage(null);   // Clear error message
  };

  // Handle Delete Action
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      mutation.mutate(selectedId);
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-6 shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Delete Contact</h2>

      <form onSubmit={handleDelete} className="space-y-4">
        {/* Dropdown to select a contact */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Contact</label>
          {isContactsLoading ? (
            <p>Loading contacts...</p>
          ) : isError ? (
            <p className="text-red-500">Failed to load contacts.</p>
          ) : (
            <select
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
              value={selectedId || ''}
              onChange={handleDropdownChange}
            >
              <option value="" disabled>
                Select a contact
              </option>
              {contacts?.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.id} | {contact.firstName} {contact.lastName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Delete Button */}
        <button
          type="submit"
          disabled={!selectedId || mutation.isPending}
          className={`w-full py-2 rounded text-white transition ${
            !selectedId
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {mutation.isPending ? 'Deleting...' : 'Delete Contact'}
        </button>
      </form>

      {/* Success Message */}
      {successMessage && (
        <p className="text-green-500 text-center mt-4">{successMessage}</p>
      )}

      {/* Error Message */}
      {errorMessage && (
        <p className="text-red-500 text-center mt-4">{errorMessage}</p>
      )}
    </div>
  );
};

export default DeleteContact;
