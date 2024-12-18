import { createFileRoute, Link } from '@tanstack/react-router';

//Contact type declaration
type Contact = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

//Ensures dynamic routing
export const Route = createFileRoute('/$contactId')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const contactId = params.contactId;

    // Fetch a single contact by ID
    const fetchContactById = async (id: string): Promise<Contact> => {
      const response = await fetch(`http://localhost:5000/contacts/${id}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      return response.json();
    };

    const contact = await fetchContactById(contactId);
    return { contact }; // Return an object with the fetched data
  },
  pendingComponent: () => <div className='min-h-screen bg-gray-950'><p className='font-bold text-white p-8 text-xl'>Loading...</p></div>,
  errorComponent: () => <div className='min-h-screen bg-gray-950'><p className='font-bold text-white p-8 text-xl'>Error Loading Contact</p></div>,
});

function RouteComponent() {
  const { contact } = Route.useLoaderData() as { contact: Contact };

  return (
    <div className="bg-gray-950 min-h-screen text-white p-10">
      <div className="">
        <Link
          to="/"
          className="ml-4 bg-blue-700 p-3 rounded-md hover:underline font-semibold "
        >
          ← Back to Contact Table
        </Link>
      </div>
      <div className='p-4 rounded'>
        <h1 className="text-2xl font-bold mb-4">Contact Details</h1>
        <div className="space-y-2">
          <p>
            <strong>ID:</strong> {contact.id}
          </p>
          <p>
            <strong>First Name:</strong> {contact.firstName}
          </p>
          <p>
            <strong>Last Name:</strong> {contact.lastName}
          </p>
          <p>
            <strong>Email:</strong> {contact.email}
          </p>
        </div>
      </div>
      
    </div>
  );
}
