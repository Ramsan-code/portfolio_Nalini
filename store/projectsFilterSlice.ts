import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ProjectCategory } from "@/data/types"

export type ProjectFilter = ProjectCategory | "all"

interface ProjectsFilterState {
  active: ProjectFilter
}

const initialState: ProjectsFilterState = { active: "all" }

const projectsFilterSlice = createSlice({
  name: "projectsFilter",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<ProjectFilter>) {
      state.active = action.payload
    },
  },
})

export const { setFilter } = projectsFilterSlice.actions
export default projectsFilterSlice.reducer
