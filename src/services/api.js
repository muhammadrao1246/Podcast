// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getToken } from './token'



export const {VITE_APP_BACKEND_SERVER} = import.meta.env
// Define a service using a base URL and expected endpoints
export const userAuthApi = createApi({
  reducerPath: 'userAuthApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${VITE_APP_BACKEND_SERVER}/api/` }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
        query: (user)=>{
            return  {
                url: "auth/register",
                method: "POST",
                body: user,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    loginUser: builder.mutation({
        query: (user)=>{
            return  {
                url: "auth/login",
                method: "POST",
                body: user,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    getEpisodesList: builder.mutation({
        query: ()=>{
            return  {
                url: "episodes",
                method: "GET",
                // body: user,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
    getEpisodeChaptersList: builder.mutation({
        query: (episode)=>{
            return  {
                url: `episodes/${episode}/chapters`,
                method: "GET",
                // body: user,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
    updateEpisodeChapter: builder.mutation({
        query: (data)=>{
            const {episodeId, chapterId, body} = data
            return  {
                url: `episodes/${episodeId}/chapters/${chapterId}`,
                method: "PUT",
                body: body,
                headers: {
                    // 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
    getEpisodesDetail: builder.mutation({
        query: (episode)=>{
            return  {
                url: `episodes/${episode}`,
                method: "GET",
                // body: user,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
    deleteEpisodes: builder.mutation({
        query: (episode)=>{
            return  {
                url: `episodes/${episode}/delete`,
                method: "GET",
                // body: user,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
    saveEpisodesSheet: builder.mutation({
        query: (body)=>{
            return  {
                url: `episodes/add`,
                method: "POST",
                body: body,
                headers: {
                    // 'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${getToken().access_token}`
                }
            }
        }
    }),
  }),
})


// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetEpisodesListMutation,
  useGetEpisodeChaptersListMutation,
  useGetEpisodesDetailMutation,
  useSaveEpisodesSheetMutation,
  useUpdateEpisodeChapterMutation,
  useDeleteEpisodesMutation
} = userAuthApi;