import Button from "@/components/commons/Button";
import useModal from "@/hooks/useModal";
import IconAlert from "@public/icons/icon-modal-alert.svg";

interface UpdateRoomReservationModalProps {
  onConfirm: () => void;
}

function UpdateRoomReservationModal({
  onConfirm,
}: UpdateRoomReservationModalProps) {
  const { closeModal } = useModal();

  return (
    <div className="flex h-213 w-370 cursor-default flex-col items-center justify-between rounded-16 bg-white px-32 py-24">
      <IconAlert />
      <p className="text-17-500 text-gray-100">회의실 예약을 수정하시겠어요?</p>
      <div className="flex gap-20">
        <Button
          onClick={closeModal}
          variant="secondary"
          size="modal"
          width="w-86"
          height="h-40"
        >
          취소하기
        </Button>
        <Button onClick={onConfirm} size="modal" width="w-86" height="h-40">
          수정
        </Button>
      </div>
    </div>
  );
}

export default UpdateRoomReservationModal;
