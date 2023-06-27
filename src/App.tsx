import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { z } from 'zod'

import { PlusCircle, XCircle } from 'lucide-react'

import { Form } from './components/Form'

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const createUserFormSchema = z.object({
  avatar: z.instanceof(FileList)
    .refine((files) => !!files.item(0), "A imagem de perfil é obrigatória")
    .refine((files) => !!files.item(0) && files.item(0)!.size <= MAX_FILE_SIZE, `Tamanho máximo de 5MB`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files.item(0)?.type || ''),
      "Formato de imagem inválido"
    ).transform(files => {
      return files.item(0)!
    }),
  name: z.string().nonempty('O nome é obrigatório').transform(name => {
    return name
        .trim()
        .split(' ')
        .map(word => word[0].toLocaleUpperCase().concat(word.substring(1)))
        .join(' ')
  }),
  email: z.string()
    .nonempty('O e-mail é obrigatório')
    .email('Formato de e-mail inválido')
    .toLowerCase(),
  password: z.string().min(6, 'A senha precisa de no mínimo 6 caracteres'),
  techs: z.array(z.object({
    title: z.string().nonempty('O título é obrigatório'),
    knowledge: z.coerce.number().min(1, 'O valor precisa ser maior que 0').max(100, 'O valor precisa ser menor que 100')
  })).min(2, 'Insira pelo menos 2 tecnologias')
})

type CreateUserFormData = z.infer<typeof createUserFormSchema>

export function App() {
  const [output, setOutput] = useState('')

  const createUserForm  = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema)
  })

  const { 
    handleSubmit, 
    formState: { isSubmitting }, 
    watch,
    control,
  } = createUserForm;

  function createUser(data: CreateUserFormData) {
    console.log(data.avatar)
    setOutput(JSON.stringify(data, (key, value) => key === 'avatar' ? undefined : value, 2))
  }

  const userPassword = watch('password')
  const isPasswordStrong = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})').test(userPassword)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  })

  function addNewTech() {
    append({ title: '', knowledge: 0})
  }



  return (
    <main className="min-h-screen bg-zinc-950 flex flex-row gap-6 items-center justify-center">
      <FormProvider {...createUserForm}>
        <form 
          className="flex flex-col gap-4 w-full max-w-xs" 
          onSubmit={handleSubmit(createUser)}
        >
          <Form.Field>
            <Form.Label htmlFor="avatar">
              Avatar
            </Form.Label>
            <Form.Input type="file" name="avatar" />
            <Form.ErrorMessage field="avatar" />
          </Form.Field>


          <Form.Field>
            <Form.Label htmlFor="name">
              Nome
            </Form.Label>
            <Form.Input type="text" name="name" />
            <Form.ErrorMessage field="name" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="email">
              E-mail
            </Form.Label>
            <Form.Input type="email" name="email" />
            <Form.ErrorMessage field="email" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="password">
              Senha
              {userPassword?.length > 0 && (
                <span className={`text-xs ${isPasswordStrong ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPasswordStrong ? 'Senha forte' : 'Senha fraca'}
                </span>
              )}
              
            </Form.Label>
            <Form.Input type="password" name="password" />
            <Form.ErrorMessage field="password" />
          </Form.Field>

          <Form.Field>
            <Form.Label>
              Tecnologias

              <button 
                type='button'
                onClick={addNewTech} 
                className='text-emerald-500 text-xs font-semibold flex items-center gap-1'>
                  Adicionar nova
                  <PlusCircle size={14} />
              </button>
            </Form.Label>
            <Form.ErrorMessage field="techs" />

            {fields.map((field, index) => {
              const fieldNameTitle = `techs.${index}.title`
              const fieldNameKnowledge = `techs.${index}.knowledge`
              
              return (
                <Form.Field key={field.id}>
                <div className="flex gap-2 items-center">
                  <Form.Input type="text" name={fieldNameTitle} />
                  <Form.Input className='w-16' type="number" name={fieldNameKnowledge} />
                  <button 
                    type="button" 
                    onClick={() => remove(index)}
                    className="text-red-500"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
                <Form.ErrorMessage field={fieldNameTitle} />
                <Form.ErrorMessage field={fieldNameKnowledge} />
              </Form.Field>
              )
            })}
          </Form.Field>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-emerald-500 rounded font-semibold text-white h-10 hover:bg-emerald-600"
          >
            Salvar
          </button>
        </form>
      </FormProvider>

      {output && (
        <pre className="text-sm bg-zinc-800 text-zinc-100 p-6 rounded-lg">
          {output}
        </pre>
      )}
    </main>
  )
}
