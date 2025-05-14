'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from '@/components/ui/use-toast'
import { getVietnameseDishStatus, handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UpdateDishBody, UpdateDishBodyType } from '@/schemaValidations/dish.schema'
import { DishStatus, DishStatusValues } from '@/constants/type'
import { Textarea } from '@/components/ui/textarea'

const EditDish = ({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) => {
  const [file, setFile] = useState<File | null>(null)
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const form = useForm<UpdateDishBodyType>({
    resolver: zodResolver(UpdateDishBody),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      image: '',
      status: DishStatus.Unavailable
    }
  })

  const image = form.watch('image')
  const name = form.watch('name')

  const previewAvatarFromFile = useMemo(() => {
    return file ? URL.createObjectURL(file) : image
  }, [file, image])

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) setId(undefined)
      }}
    >
      <DialogContent className='max-h-screen overflow-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Edit Dish</DialogTitle>
          <DialogDescription>The following fields are required: name, image</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' id='edit-dish-form'>
            <div className='grid gap-4 py-4'>
              {/* Image field */}
              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-start gap-2'>
                      <Avatar className='aspect-square h-[100px] w-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatarFromFile} />
                        <AvatarFallback className='rounded-none'>{name || 'Avatar'}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        ref={imageInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + file.name)
                          }
                        }}
                        className='hidden'
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => imageInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              {/* Name field */}
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='name'>Dish Name</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Price field */}
              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='price'>Price</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='price' type='number' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Description field */}
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='description'>Description</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea id='description' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {/* Status field */}
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label htmlFor='status'>Status</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DishStatusValues.map((status) => (
                              <SelectItem key={status} value={status}>
                                {getVietnameseDishStatus(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='edit-dish-form'>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditDish
