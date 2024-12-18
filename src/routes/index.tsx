import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import CreateContact from '@/Components/createContact';
import DeleteContact from '@/Components/deleteContact';
import UpdateContact from '@/Components/updateContact';

//Ensures route of page is the root
export const Route = createFileRoute('/')({
  component: Index,
});


function Index() {
  //Contact type declaration
  type Contact = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  // Fetching contacts from the API using TanStack Query
  const { data: contacts, isLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await fetch('http://localhost:5000/contacts');
      if (!response.ok) throw new Error('Failed to fetch contacts');
      return response.json();
    },
  });

  
  //TanStack Table Column Helper
  const columnHelper = createColumnHelper<Contact>();

  const columns = [
    columnHelper.accessor('firstName', {
      cell: (info) => info.getValue(),
      header: 'First Name',
    }),
    columnHelper.accessor('lastName', {
      cell: (info) => <i>{info.getValue()}</i>,
      header: 'Last Name',
    }),
    columnHelper.accessor('email', {
      cell: (info) => info.getValue(),
      header: 'Email',
    }),
  ];

  const table = useReactTable({
    data: contacts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  if (isLoading) return <div>Loading contacts...</div>;
  if (isError) return <div>Error loading contacts.</div>;

  return (
    <div className="overflow-x-auto bg-gray-950 text-white min-h-screen p-10">
      <table className="w-full border-collapse text-center">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="border border-white" key={row.id}>
              {/* Render Cells */}
              {row.getVisibleCells().map((cell) => (
                <td className="p-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}

              <td>
                <Link
                  to={`/${row.original.id}`} 
                  className="p-2 border-black bg-blue-800 text-white rounded"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='flex'>
        <CreateContact />
        <UpdateContact />
        <DeleteContact />
      </div>
      
    </div>
  );
}
