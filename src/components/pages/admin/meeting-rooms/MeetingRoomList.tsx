/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import ListItem from "@/components/commons/ListItem";
import Popover from "@/components/commons/Popover";
import QUERY_KEY from "@/constants/queryKey";
import useClickOutside from "@/hooks/useClickOutside";
import useToast from "@/hooks/useToast";
import {
  createResource,
  deleteResource,
  updateResource,
} from "@/lib/api/amplify/resource";
import { checkGoogleCalendarId } from "@/lib/api/googleCalendar";
import ArrowDown from "@public/icons/icon-arrow-down.svg";
import IconKebab from "@public/icons/icon-kebab.svg";
import IconPlus from "@public/icons/icon-plus.svg";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

interface Resource {
  id: string;
  name: string;
  googleResourceId?: string | null;
  resourceSubtype?: string | null;
}

interface FormValues {
  name: string;
  googleResourceId: string;
}

export default function MeetingRoomList({
  title,
  items,
}: {
  title: string;
  items: Resource[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [listItems, setListItems] = useState(items);
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>();

  useEffect(() => {
    setListItems(items);
  }, [items]);

  // Add new item
  const handleAddItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      name: "",
      googleResourceId: "",
      resourceSubtype: title,
    };
    setListItems((prevItems) => [...prevItems, newItem]);
    setEditId(newItem.id);
    reset();
    setIsExpanded(true);
  };

  // Save new item
  const handleSaveNewItem = async (id: string) => {
    const name = watch("name").trim();
    const googleResourceId = watch("googleResourceId").trim();
    if (!name || !googleResourceId) {
      handleCancelEdit(id);
      return;
    }

    const session = await getSession();
    const checkGoogleCalendar = await checkGoogleCalendarId(
      googleResourceId,
      session?.accessToken || "",
    );

    if (!checkGoogleCalendar) {
      error("존재하지 않는 리소스입니다. ID를 확인해주세요.");
      handleCancelEdit(id);
      return;
    }

    const isDuplicate = listItems.some((item) => item.name.trim() === name);
    if (isDuplicate) {
      error("이미 존재하는 이름입니다. 다른 이름을 사용해 주세요.");
      handleCancelEdit(id);
      return;
    }

    try {
      const newResource = await createResource({
        resourceType: "ROOM",
        resourceSubtype: title,
        name,
        googleResourceId,
      });

      const newResourceData = newResource.data;

      if (newResourceData) {
        setListItems((prevItems) => {
          const updatedItems = prevItems.map((item) =>
            item.id === id
              ? { ...item, id: newResourceData.id, name, googleResourceId }
              : item,
          );
          return updatedItems.sort((a, b) => a.name.localeCompare(b.name));
        });
        success(`회의실 ${name}이(가) 추가되었습니다.`);
        setEditId(null);
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROOM_LIST] });
      }
    } catch {
      error("새로운 회의실 추가에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // Update item
  const handleUpdateItem = async (id: string) => {
    const name = watch("name").trim();
    const googleResourceId = watch("googleResourceId").trim();

    const previousItem = listItems.find((item) => item.id === id);
    const previousName = previousItem?.name;
    const previousGoogleResourceId = previousItem?.googleResourceId;

    if (
      (!name || name === previousName) &&
      (!googleResourceId || googleResourceId === previousGoogleResourceId)
    ) {
      setEditId(null);
      reset();
      return;
    }

    const isDuplicate = listItems.some(
      (item) => item.id !== id && item.name.trim() === name,
    );

    const session = await getSession();
    const checkGoogleCalendar = await checkGoogleCalendarId(
      googleResourceId,
      session?.accessToken || "",
    );

    if (!checkGoogleCalendar) {
      error("존재하지 않는 리소스입니다. ID를 확인해주세요.");
      setEditId(null);
      reset();
      return;
    }

    if (isDuplicate) {
      error("이미 존재하는 이름입니다. 다른 이름을 사용해 주세요.");
      setEditId(null);
      reset();
      return;
    }

    try {
      const { data: updatedResource } = await updateResource({
        id,
        name,
        googleResourceId,
      });

      setListItems((prevItems) => {
        const updatedItems = prevItems.map((item) =>
          item.id === id
            ? {
                ...item,
                id: updatedResource?.id as string,
                name,
                googleResourceId,
              }
            : item,
        );
        return updatedItems.sort((a, b) => a.name.localeCompare(b.name));
      });
      success("회의실 정보가 성공적으로 변경되었습니다.");
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROOM_LIST] });
    } catch {
      error("회의실 정보 변경에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string, name: string) => {
    try {
      await deleteResource(id);
      setListItems((prevItems) => prevItems.filter((item) => item.id !== id));
      success(`회의실 ${name}이(가) 성공적으로 삭제되었습니다.`);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.ROOM_LIST] });
    } catch {
      error(`회의실 ${name} 삭제를 실패했습니다. 다시 시도해 주세요.`);
    }
  };

  // Cancel edit
  const handleCancelEdit = (id: string) => {
    setListItems((prevItems) => prevItems.filter((item) => item.id !== id));
    setEditId(null);
    reset();
  };

  const handleSubmitForm = (id: string) => {
    if (id.startsWith("temp-")) handleSaveNewItem(id);
    else handleUpdateItem(id);
  };

  useClickOutside({
    ref: formRef,
    handler: () => {
      if (!editId) return;
      handleSubmit(() => handleSubmitForm(editId))();
    },
  });

  return (
    <div>
      <ListItem isBackground>
        <ListItem.Title text="text-18-500">{title}</ListItem.Title>
        <ListItem.Right>
          <div className="flex gap-16">
            <button onClick={handleAddItem} type="button">
              <IconPlus />
            </button>
            <button type="button" onClick={() => setIsExpanded(!isExpanded)}>
              <ArrowDown />
            </button>
          </div>
        </ListItem.Right>
      </ListItem>

      <AnimatePresence>
        {isExpanded && (
          <motion.ul
            className="ml-24 mt-8 flex flex-col gap-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {listItems.map((item) => (
              <motion.li key={item.id} layout>
                <ListItem isEditMode={editId === item.id} height="h-56">
                  {editId === item.id ? (
                    <form
                      onSubmit={handleSubmit(() => handleSubmitForm(editId))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit(() => handleSubmitForm(editId))();
                        }
                      }}
                      ref={formRef}
                      className="mr-12 flex w-full gap-8"
                    >
                      <input
                        placeholder="회의실 이름"
                        {...register("name", { required: true })}
                        defaultValue={item.name}
                        className="w-full flex-1 rounded-md border border-gray-50 p-2 focus:outline-none focus:ring-2 focus:ring-purple-70 focus:ring-opacity-50"
                      />
                      <input
                        placeholder="구글 리소스 아이디"
                        {...register("googleResourceId", { required: true })}
                        defaultValue={item.googleResourceId as string}
                        className="w-full flex-[1.6] rounded-md border border-gray-50 p-2 focus:outline-none focus:ring-2 focus:ring-purple-70 focus:ring-opacity-50"
                      />
                    </form>
                  ) : (
                    <ListItem.Title>{item.name}</ListItem.Title>
                  )}
                  <ListItem.Right>
                    <Popover>
                      <Popover.Toggle icon={<IconKebab />} />
                      <Popover.Wrapper>
                        <Popover.Item
                          label="이름 변경"
                          onClick={() => {
                            setEditId(item.id);
                            setValue("name", item.name);
                            setValue(
                              "googleResourceId",
                              item.googleResourceId as string,
                            );
                          }}
                        />
                        <Popover.Item
                          label="삭제"
                          onClick={() => handleDeleteItem(item.id, item.name)}
                        />
                      </Popover.Wrapper>
                    </Popover>
                  </ListItem.Right>
                </ListItem>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
