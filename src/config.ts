import { z } from 'zod'

const configSchema = z.object({
  NEXT_PUBLIC_API_ENDPOINT: z.string(),
  NEXT_PUBLIC_URL: z.string()
})

// It will validate whether the values conform to the schema or not  
const configProject = configSchema.safeParse({
  NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL
})

// If they don't, it will throw an error
if (!configProject.success) {
  console.error(configProject.error.issues)
  throw new Error('Not found env variables')
}

const envConfig = configProject.data
export default envConfig
