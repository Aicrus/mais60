export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          email: string | null
          nome: string | null
          telefone: string | null
          emergency_contact: string | null
          criado_em: string
          atualizado_em: string
          perfil_concluido: boolean
          genero: string | null
          idade: number | null
        }
        Insert: {
          id: string
          email?: string | null
          nome?: string | null
          telefone?: string | null
          emergency_contact?: string | null
          criado_em?: string
          atualizado_em?: string
          perfil_concluido?: boolean
          genero?: string | null
          idade?: number | null
        }
        Update: {
          id?: string
          email?: string | null
          nome?: string | null
          telefone?: string | null
          emergency_contact?: string | null
          criado_em?: string
          atualizado_em?: string
          perfil_concluido?: boolean
          genero?: string | null
          idade?: number | null
        }
      }
    }
  }
} 