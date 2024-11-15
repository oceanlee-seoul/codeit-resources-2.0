import Popover from "@/components/commons/Popover";
import ChevronLeft from "@public/icons/icon-chevron-left.svg";
import ChevronRight from "@public/icons/icon-chevron-right.svg";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const MAX_PAGE = 3;

export default function GoogleResourceIDPopover() {
  const [currentPage, setCurrentPage] = useState(1);

  const handleCurrentPageChange = (newPage: number) => {
    if (newPage <= 0 || newPage > MAX_PAGE) return;
    setCurrentPage(newPage);
  };

  return (
    <Popover>
      <Popover.Toggle icon={<ToggleIcon />} />
      <Popover.Wrapper>
        <div className="w-300 p-12 md:w-400">
          <h1 className="text-18-700">Google Resource ID 등록</h1>

          {currentPage === 1 && <StepOne />}
          {currentPage === 2 && <StepTwo />}
          {currentPage === 3 && <StepThree />}

          <div className="flex items-center justify-between">
            <Link
              href="https://calendar.google.com/calendar/u/1/r/settings"
              className="w-max text-14-500 text-gray-80 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              설정 페이지 이동하기
            </Link>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  handleCurrentPageChange(currentPage - 1);
                }}
              >
                <ChevronLeft />
              </button>
              <span className="float-right text-14-400 text-gray-90">
                {currentPage} / {MAX_PAGE}
              </span>
              <button
                type="button"
                onClick={() => {
                  handleCurrentPageChange(currentPage + 1);
                }}
              >
                <ChevronRight className="" />
              </button>
            </div>
          </div>
        </div>
      </Popover.Wrapper>
    </Popover>
  );
}

function ToggleIcon() {
  return (
    <div className="flex size-36 items-center justify-center rounded-6 border border-gray-60 bg-gray-20 text-gray-70 hover:bg-gray-30">
      ?
    </div>
  );
}

function StepOne() {
  return (
    <>
      <span className="mt-12 block">
        1. 구글 캘린더의 설정 페이지로 들어가주세요.
      </span>
      <div className="my-8 flex h-200 w-full items-center justify-center rounded-6 bg-purple-50">
        <Image
          src="/images/resource-id-step1.png"
          alt="step-img"
          width={288}
          height={120}
          className="rounded-6"
        />
      </div>
    </>
  );
}

function StepTwo() {
  return (
    <>
      <span className="mt-12 block">2. 등록하려는 리소스를 클릭해주세요.</span>
      <div className="my-8 flex h-200 w-full items-center justify-center rounded-6 bg-purple-50">
        <Image
          src="/images/resource-id-step2.png"
          alt="step-img"
          width={288}
          height={120}
          className="rounded-6"
        />
      </div>
    </>
  );
}

function StepThree() {
  return (
    <>
      <span className="mt-12 block">
        3. 캘린더 통합에서 캘린더 ID를 찾아 등록해주세요.
      </span>
      <div className="my-8 flex h-200 w-full items-center justify-center rounded-6 bg-purple-50">
        <Image
          src="/images/resource-id-step3.png"
          alt="step-img"
          width={300}
          height={120}
          className="rounded-6"
        />
      </div>
    </>
  );
}
