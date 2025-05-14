import accountApiRequest from '@/apiRequests/account'
import {
  ChangePasswordBodyType,
  CreateEmployeeAccountBodyType,
  UpdateEmployeeAccountBodyType,
  UpdateMeBodyType
} from '@/schemaValidations/account.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useAccountMe = () => {
  return useQuery({
    queryKey: ['account-me'],
    queryFn: () => accountApiRequest.getMeProfile()
  })
}

export const useUpdateMeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdateMeBodyType) => accountApiRequest.updateMeProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-me'] })
    }
  })
}

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (body: ChangePasswordBodyType) => accountApiRequest.changePassword(body)
  })
}

// Get list account
export const useGetListAccountQuery = () => {
  return useQuery({
    queryKey: ['account-list'],
    queryFn: () => accountApiRequest.getListAccount()
  })
}

// Get detail employee
export const useGetEmployeeQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ['employee-account', id],
    queryFn: () => accountApiRequest.getEmployeeDetail(id),
    enabled
  })
}

// Add employee account
export const useAddEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEmployeeAccountBodyType) => accountApiRequest.addEmployee(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-list'] })
    }
  })
}

// Update employee account
export const useUpdateEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEmployeeAccountBodyType & { id: number }) =>
      accountApiRequest.updateEmployee(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-list'] })
    }
  })
}

// Delete employee account
export const useDeleteEmployeeMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (employeeId: number) => accountApiRequest.deleteEmployee(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-list'] })
    }
  })
}
