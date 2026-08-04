/**
 * React Query hooks for the family graph. These are the primary data entry
 * points for the tree, profiles, and AI screens.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import {
  addRelationship,
  createPerson,
  deletePerson,
  fetchPeople,
  fetchRelationships,
  getSelfId,
  updatePerson,
} from '@/services/api/family-repo';
import type { Person, RelatedPerson, Relationship } from '@/types/models';
import { buildGraph, relationLabel } from '@/utils/relationships';

const KEYS = {
  people: ['family', 'people'] as const,
  relationships: ['family', 'relationships'] as const,
};

export function useFamily() {
  const peopleQ = useQuery({ queryKey: KEYS.people, queryFn: fetchPeople });
  const relsQ = useQuery({ queryKey: KEYS.relationships, queryFn: fetchRelationships });

  const selfId = getSelfId();
  const people = peopleQ.data;
  const relationships = relsQ.data;

  const graph = useMemo(
    () => (relationships ? buildGraph(relationships) : null),
    [relationships],
  );

  /** People decorated with their relationship label to the current user. */
  const related = useMemo<RelatedPerson[]>(() => {
    if (!people || !graph) return [];
    return people.map((p) => {
      // "Self" is whoever is viewing (their own node in the shared family).
      const isSelf = p.id === selfId;
      const { label, generation } = relationLabel(graph, selfId, p);
      // Computed relationship is primary; a free-text relation is a fallback
      // only when the graph can't determine one.
      const relationLabelFinal = !isSelf && label === 'Relative' ? p.relation?.trim() || label : label;
      return { ...p, isSelf, relationLabel: relationLabelFinal, generation };
    });
  }, [people, graph, selfId]);

  return {
    isLoading: peopleQ.isLoading || relsQ.isLoading,
    isError: peopleQ.isError || relsQ.isError,
    people: people ?? [],
    relationships: relationships ?? [],
    related,
    graph,
    selfId,
    self: people?.find((p) => p.id === selfId),
    refetch: () => {
      peopleQ.refetch();
      relsQ.refetch();
    },
  };
}

/** A single person, decorated with their relationship label to the current user. */
export function useRelatedPerson(id: string): RelatedPerson | undefined {
  const { people, graph, selfId } = useFamily();
  return useMemo(() => {
    const person = people.find((p) => p.id === id);
    if (!person || !graph) return undefined;
    const isSelf = person.id === selfId;
    const { label, generation } = relationLabel(graph, selfId, person);
    const relationLabelFinal = !isSelf && label === 'Relative' ? person.relation?.trim() || label : label;
    return { ...person, isSelf, relationLabel: relationLabelFinal, generation };
  }, [people, graph, selfId, id]);
}

export function useCreatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<Person>) => createPerson(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.people }),
  });
}

export function useUpdatePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (person: Person) => updatePerson(person),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.people }),
  });
}

export function useAddRelationship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rel: { fromId: string; toId: string; type: Relationship['type'] }) => addRelationship(rel),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.relationships }),
  });
}

export function useDeletePerson() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.people });
      qc.invalidateQueries({ queryKey: KEYS.relationships });
    },
  });
}
