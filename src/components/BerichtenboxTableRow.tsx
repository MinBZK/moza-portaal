import React from "react";

export const BerichtenboxTableRow: React.FC<{ index: number }> = ({
  index,
}) => {
  return (
    <tr className="cursor-pointer border-b border-neutral-200 hover:bg-gray-100">
      <td className="w-2/6 max-w-2/6 py-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="h-4 w-4 appearance-none rounded-sm border-2 border-gray-500 bg-white"
          />
          {index === 0 ? (
            <span className="flex flex-row items-center gap-2 pl-3 font-bold">
              <span className="circle h-2 w-2 rounded-full bg-red-500"></span>
              <span>Belastingdienst</span>
            </span>
          ) : (
            <span className="pl-3">Belastingdienst</span>
          )}
        </div>
      </td>
      <td className="w-3/6 max-w-3/6 px-2 py-2">
        {index === 0 ? (
          <span className="text-blue-text hover:underline">
            Aanslag belastingen 2025
          </span>
        ) : (
          <span className="text-gray hover:text-blue-text hover:underline">
            Aanslag belastingen 2025
          </span>
        )}
      </td>
      <td className="w-1/6 max-w-1/6 py-2">
        <div className="flex items-center">
          <svg
            fill="#000000"
            width="15px"
            height="20px"
            viewBox="0 0 32 32"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              xmlns="http://www.w3.org/2000/svg"
              d="M23.679 32a6.263 6.263 0 0 1-4.472-1.874L4.59 15.314c-3.453-3.5-3.453-9.192 0-12.691a8.786 8.786 0 0 1 12.523 0L28.152 13.81c.494.5.494 1.312 0 1.812a1.252 1.252 0 0 1-1.79 0L15.325 4.436a6.278 6.278 0 0 0-8.946 0c-2.465 2.5-2.465 6.565 0 9.065l14.618 14.812a3.767 3.767 0 0 0 5.367 0 3.89 3.89 0 0 0 .095-5.339L11.743 8.062a1.256 1.256 0 0 0-1.788 0 1.295 1.295 0 0 0 0 1.812l11.041 11.188c.494.5.494 1.311 0 1.813-.495.5-1.295.5-1.79 0L8.168 11.686a3.884 3.884 0 0 1 0-5.436 3.766 3.766 0 0 1 5.366-.001l14.619 14.813c2.464 2.499 2.464 6.565 0 9.064A6.265 6.265 0 0 1 23.679 32"
              fill="#282828"
              fillRule="evenodd"
            />
          </svg>
          <span className="pl-1">21/02/2025</span>

          <svg
            fill="#077ec8"
            version="1.1"
            baseProfile="tiny"
            width="20px"
            height="20px"
            viewBox="0 0 42 42"
            className="pl-2"
          >
            <polygon
              fillRule="evenodd"
              points="13.933,1 34,21.068 14.431,40.637 9.498,35.704 24.136,21.068 9,5.933 "
            />
          </svg>
        </div>
      </td>
    </tr>
  );
};
