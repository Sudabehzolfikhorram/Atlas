import React, { useEffect, useState } from "react";
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text, Textarea } from "@chakra-ui/react";
import { people } from "../../data/currentUser";
import type { Priority } from "../../types/intel";
import type { BusinessPriority, PriorityTask } from "../../types/priorities";
interface Props {
  item: BusinessPriority | null;
  onClose: () => void;
  onCreate: (task: Omit<PriorityTask, "createdAt">) => void;
}
const defaultDue = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
};
export function CreateTaskModal({
  item,
  onClose,
  onCreate
}: Props) {
  const [owner, setOwner] = useState("");
  const [due, setDue] = useState(defaultDue());
  const [priority, setPriority] = useState<Priority>("P2");
  const [criteria, setCriteria] = useState("");
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!item) return;
    setOwner(item.ownership.decisionMaker.name === "Dana Whitfield" ? item.affected.people[0]?.name ?? "" : item.ownership.decisionMaker.name);
    setDue(defaultDue());
    setPriority(item.severity === "critical" ? "P1" : item.severity === "high" ? "P2" : "P3");
    setCriteria(item.completionCriteria);
    setTouched(false);
  }, [item]);
  const valid = owner && due && criteria.trim();
  return <Modal isOpen={!!item} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="!pb-1">
          <Text className="text-[16px] font-semibold text-white">Create task</Text>
          {item && <Text className="mt-0.5 text-[12.5px] font-normal text-slate-400">{item.id} · {item.title}</Text>}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody className="space-y-4">
          <FormControl isRequired isInvalid={touched && !owner}>
            <FormLabel className="!text-[12.5px]">Owner</FormLabel>
            <Select value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Select an owner">
              {people.map((p) => <option key={p.name} value={p.name}>{p.name} · {p.role}</option>)}
            </Select>
            <FormErrorMessage>Assign an owner.</FormErrorMessage>
          </FormControl>
          <Box className="grid gap-4 sm:grid-cols-2">
            <FormControl isRequired isInvalid={touched && !due}>
              <FormLabel className="!text-[12.5px]">Deadline</FormLabel>
              <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              <FormErrorMessage>Choose a deadline.</FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel className="!text-[12.5px]">Priority</FormLabel>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
                <option value="P1">P1 · Critical</option>
                <option value="P2">P2 · High</option>
                <option value="P3">P3 · Normal</option>
              </Select>
            </FormControl>
          </Box>
          <FormControl isRequired isInvalid={touched && !criteria.trim()}>
            <FormLabel className="!text-[12.5px]">Completion criteria</FormLabel>
            <Textarea rows={3} value={criteria} onChange={(e) => setCriteria(e.target.value)} />
            <FormErrorMessage>Describe what “done” means.</FormErrorMessage>
          </FormControl>
          <Text className="text-[11.5px] text-slate-500">The task is recorded in the audit trail and tracked in this section's follow-up list.</Text>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => {
          setTouched(true);
          if (valid) onCreate({
            owner,
            due,
            priority,
            criteria: criteria.trim()
          });
        }}>
            Create task
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>;
}