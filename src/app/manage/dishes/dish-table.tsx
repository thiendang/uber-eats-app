'use client'

import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

// UI components
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// State & logic
import { createContext, useContext, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { formatCurrency, getVietnameseDishStatus } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'

// App-specific logic
import AutoPagination from '@/components/auto-pagination'
import { DishListResType } from '@/schemaValidations/dish.schema'
import EditDish from '@/app/manage/dishes/edit-dish'
import AddDish from '@/app/manage/dishes/add-dish'

// Define a single dish item type
type DishItem = DishListResType['data'][0]

// Context to manage edit/delete states
const DishTableContext = createContext<{
  setDishIdEdit: (value: number) => void
  dishIdEdit: number | undefined
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}>({
  setDishIdEdit: () => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: () => {}
})

// Column definitions for the dish table
export const columns: ColumnDef<DishItem>[] = [
  { accessorKey: 'id', header: 'ID' },
  {
    accessorKey: 'image',
    header: 'Image',
    cell: ({ row }) => (
      <Avatar className='aspect-square h-[100px] w-[100px] rounded-md object-cover'>
        <AvatarImage src={row.getValue('image')} />
        <AvatarFallback>{row.original.name}</AvatarFallback>
      </Avatar>
    )
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div dangerouslySetInnerHTML={{ __html: row.getValue('description') }} className='whitespace-pre-line' />
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{getVietnameseDishStatus(row.getValue('status'))}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setDishIdEdit, setDishDelete } = useContext(DishTableContext)
      const openEditDish = () => setDishIdEdit(row.original.id)
      const openDeleteDish = () => setDishDelete(row.original)

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <DotsHorizontalIcon className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openEditDish}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteDish}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

// Delete confirmation dialog
function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete
}: {
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}) {
  return (
    <AlertDialog
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) setDishDelete(null)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this dish?</AlertDialogTitle>
          <AlertDialogDescription>
            The dish <span className='rounded bg-foreground px-1 text-primary-foreground'>{dishDelete?.name}</span> will
            be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Default pagination page size
const PAGE_SIZE = 10

const DishTable = () => {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1

  const [dishIdEdit, setDishIdEdit] = useState<number | undefined>()
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null)
  const data: DishItem[] = []

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Initial page index (will be overridden if using async data)
    pageSize: PAGE_SIZE
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  // Sync pagination when URL param changes
  useEffect(() => {
    table.setPagination({ pageIndex, pageSize: PAGE_SIZE })
  }, [table, pageIndex])

  return (
    <DishTableContext.Provider value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
      <div className='w-full'>
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish dishDelete={dishDelete} setDishDelete={setDishDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter by name'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddDish />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='flex-1 py-4 text-xs text-muted-foreground'>
            Showing <strong>{table.getPaginationRowModel().rows.length}</strong> of <strong>{data.length}</strong>{' '}
            results
          </div>
          <AutoPagination
            page={table.getState().pagination.pageIndex + 1}
            pageSize={table.getPageCount()}
            pathname='/manage/dishes'
          />
        </div>
      </div>
    </DishTableContext.Provider>
  )
}

export default DishTable
