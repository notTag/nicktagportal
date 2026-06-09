import { describe, expect, it, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import ProjectTrackerView from '@/views/ProjectTrackerView.vue'

vi.mock('projectTrackerApp/DashboardView', () => ({
  default: { template: '<div />' },
}))

describe('ProjectTrackerView', () => {
  it('renders without errors', () => {
    const wrapper = shallowMount(ProjectTrackerView)
    expect(wrapper.exists()).toBe(true)
  })

  it('renders the async Project Tracker remote component', () => {
    const wrapper = shallowMount(ProjectTrackerView)
    expect(wrapper.html()).toBeTruthy()
  })
})
