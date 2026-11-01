import React, { useEffect, useRef, useState } from "react";
import { Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, Text } from "@chakra-ui/react";
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { departments } from "../../data/catalog";
import type { AccessLevel } from "../../types/catalog";
import { ACCEPTED_FORMATS, ACCEPT_ATTR, MAX_UPLOAD_BYTES, formatBytes, formatOf } from "../../utils/catalog";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[], meta: {
    department: string;
    access: AccessLevel;
  }) => void;
}
const accessLevels: AccessLevel[] = ["Internal", "Confidential", "Restricted", "All staff"];
export function UploadModal({
  isOpen,
  onClose,
  onUpload
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [department, setDepartment] = useState("");
  const [access, setAccess] = useState<AccessLevel>("Internal");
  useEffect(() => {
    if (isOpen) {
      setFiles([]);
      setDepartment("");
      setAccess("Internal");
    }
  }, [isOpen]);
  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list)]);
  };
  const issue = (f: File) => formatOf(f.name) === "Unknown" ? "Unsupported format" : f.size > MAX_UPLOAD_BYTES ? "Too large" : f.size === 0 ? "Empty file" : null;
  return <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader className="!pb-1"><Text className="text-[16px] font-semibold text-white">Upload documents</Text></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text className="text-[12.5px] text-slate-400">Files are read in your browser and kept for this session only. Indexing for AI analysis needs the processing service, so new files will show as awaiting indexing.</Text>

          <Box role="button" tabIndex={0} aria-label="Choose files to upload" onClick={() => inputRef.current?.click()} onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }} onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }} onDragLeave={() => setDragging(false)} onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }} className={`mt-4 flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${dragging ? "border-blue-400/60 bg-blue-500/[0.08]" : "border-white/15 bg-white/[0.02] hover:border-white/25"}`}>
            <UploadCloudIcon size={22} className="text-blue-300" aria-hidden />
            <Text className="text-[13.5px] font-medium text-slate-100">Drop files here or click to browse</Text>
            <Text className="text-[11.5px] text-slate-500">{ACCEPTED_FORMATS.join(", ")} · up to {formatBytes(MAX_UPLOAD_BYTES)} each</Text>
            <input ref={inputRef} type="file" multiple accept={ACCEPT_ATTR} className="sr-only" onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }} />
          </Box>

          {files.length > 0 && <Box as="ul" className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
              {files.map((f, i) => {
            const problem = issue(f);
            return <Flex as="li" key={`${f.name}-${i}`} className="items-center gap-2 rounded-lg border border-white/[0.06] px-3 py-2 text-[12.5px]">
                    <FileIcon size={13} className="shrink-0 text-slate-400" aria-hidden />
                    <Text className="min-w-0 flex-1 truncate text-slate-200">{f.name}</Text>
                    <Text className="num text-[11px] text-slate-500">{formatBytes(f.size)}</Text>
                    {problem && <Text className="text-[11px] text-rose-300">{problem}</Text>}
                    <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles((fs) => fs.filter((_, j) => j !== i))} className="rounded p-0.5 text-slate-500 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"><XIcon size={13} /></button>
                  </Flex>;
          })}
            </Box>}

          <Box className="mt-4 grid gap-3 sm:grid-cols-2">
            <Box>
              <Text as="label" htmlFor="up-dept" className="mb-1 block text-[12px] text-slate-400">Department *</Text>
              <Select id="up-dept" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Select department">
                {departments.map((d) => <option key={d}>{d}</option>)}
              </Select>
            </Box>
            <Box>
              <Text as="label" htmlFor="up-access" className="mb-1 block text-[12px] text-slate-400">Access permission</Text>
              <Select id="up-access" value={access} onChange={(e) => setAccess(e.target.value as AccessLevel)}>
                {accessLevels.map((a) => <option key={a}>{a}</option>)}
              </Select>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter className="gap-2">
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" isDisabled={!files.length || !department} onClick={() => {
          onUpload(files, {
            department,
            access
          });
          onClose();
        }}>
            Upload {files.length ? `${files.length} file${files.length === 1 ? "" : "s"}` : ""}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>;
}