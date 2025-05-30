'use client'

import { CaretSortIcon, DotsHorizontalIcon } from '@radix-ui/react-icons'
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
import { AccountListResType, AccountType } from '@/schemaValidations/account.schema'
import AddEmployee from '@/app/manage/accounts/add-employee'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import EditEmployee from '@/app/manage/accounts/edit-employee'
import { createContext, Suspense, useContext, useEffect, useState } from 'react'
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
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { useDeleteEmployeeMutation, useGetListAccountQuery } from '@/queries/useAccount'
import { handleErrorApi } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

type AccountItem = AccountListResType['data'][0]

const AccountTableContext = createContext<{
  setEmployeeIdEdit: (value: number) => void
  employeeIdEdit: number | undefined
  employeeDelete: AccountItem | null
  setEmployeeDelete: (value: AccountItem | null) => void
}>({
  setEmployeeIdEdit: (value: number | undefined) => {},
  employeeIdEdit: undefined,
  employeeDelete: null,
  setEmployeeDelete: (value: AccountItem | null) => {}
})

export const columns: ColumnDef<AccountType>[] = [
  {
    id: 'stt',
    header: 'STT',
    cell: ({ row }) => {
      return <div>{row.index + 1}</div>
    }
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    cell: ({ row }) => (
      <div>
        <Avatar className='aspect-square h-[100px] w-[100px] rounded-md object-cover'>
          <AvatarImage src={row.getValue('avatar')} />
          <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
        </Avatar>
      </div>
    )
  },
  {
    accessorKey: 'name',
    header: 'Tên',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      return (
        <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Email
          <CaretSortIcon className='ml-2 h-4 w-4' />
        </Button>
      )
    }
    // cell: ({ row }) => <div className='lowercase'>{row.getValue('email')}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setEmployeeIdEdit, setEmployeeDelete } = useContext(AccountTableContext)
      const openEditEmployee = () => {
        setEmployeeIdEdit(row.original.id)
      }

      const openDeleteEmployee = () => {
        setEmployeeDelete(row.original)
      }
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
            <DropdownMenuItem onClick={openEditEmployee}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={openDeleteEmployee}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

// Component hiển thị khung alert để confirm là muốn xoá employee hay không
function AlertDialogDeleteAccount({
  employeeDelete,
  setEmployeeDelete
}: {
  employeeDelete: AccountItem | null
  setEmployeeDelete: (value: AccountItem | null) => void
}) {
  // Delete Account Employee
  const deleteEmployeeMutation = useDeleteEmployeeMutation()
  const deleteEmployee = async () => {
    if (employeeDelete) {
      try {
        const result = await deleteEmployeeMutation.mutateAsync(employeeDelete.id)
        toast({
          description: result.payload.message
        })

        setEmployeeDelete(null)
      } catch (error) {
        handleErrorApi({ error })
      }
    }
  }

  return (
    <AlertDialog
      open={Boolean(employeeDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setEmployeeDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
          <AlertDialogDescription>
            Tài khoản <span className='rounded bg-foreground px-1 text-primary-foreground'>{employeeDelete?.name}</span>{' '}
            sẽ bị xóa vĩnh viễn
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deleteEmployee}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
const AccountTable = () => {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  // const params = Object.fromEntries(searchParam.entries())
  //  State cho Edit Actions, Delete Actions
  const [employeeIdEdit, setEmployeeIdEdit] = useState<number | undefined>()
  const [employeeDelete, setEmployeeDelete] = useState<AccountItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE //default page size
  })

  // Get List employee query
  const { data: accountListQuery } = useGetListAccountQuery()
  console.log('Checkk account list', accountListQuery)

  // Data table
  const data: AccountItem[] = accountListQuery?.payload?.data ?? []

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

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    // <Suspense fallback={<div>Loading...</div>}>
    // </Suspense>
    <AccountTableContext.Provider value={{ employeeIdEdit, setEmployeeIdEdit, employeeDelete, setEmployeeDelete }}>
      <div className='w-full'>
        <EditEmployee id={employeeIdEdit} setId={setEmployeeIdEdit} onSubmitSuccess={() => {}} />
        <AlertDialogDeleteAccount employeeDelete={employeeDelete} setEmployeeDelete={setEmployeeDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter emails...'
            value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddEmployee />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
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
            Hiển thị <strong>{table.getPaginationRowModel().rows.length}</strong> trong <strong>{data.length}</strong>{' '}
            kết quả
          </div>
          <div>
            <Suspense fallback={<div>Loading...</div>}>
              <AutoPagination
                page={table.getState().pagination.pageIndex + 1}
                pageSize={table.getPageCount()}
                pathname='/manage/accounts'
              />
            </Suspense>
          </div>
        </div>
      </div>
    </AccountTableContext.Provider>
  )
}

export default AccountTable
