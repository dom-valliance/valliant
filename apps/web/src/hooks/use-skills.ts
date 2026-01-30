import { useQuery } from '@tanstack/react-query';
import { skillsService } from '@/lib/api/skills';

export const SKILLS_QUERY_KEY = ['skills'];

export function useSkills() {
  return useQuery({
    queryKey: SKILLS_QUERY_KEY,
    queryFn: () => skillsService.getAll(),
  });
}

export function useSkill(id: string) {
  return useQuery({
    queryKey: [...SKILLS_QUERY_KEY, id],
    queryFn: () => skillsService.getById(id),
    enabled: !!id,
  });
}

export function useSkillsByCategory(category: string) {
  return useQuery({
    queryKey: [...SKILLS_QUERY_KEY, 'category', category],
    queryFn: () => skillsService.getByCategory(category),
    enabled: !!category,
  });
}
