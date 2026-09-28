"use client";

import { useState } from "react";
import { ExpandableCheckboxGroup } from "@rijkshuisstijl-community/components-react";

const options = [
  { label: "React", value: "value" },
  { label: "CSS", value: "value2" },
  { label: "Angular", value: "value3" },
  { label: "Web Component", value: "value4" },
  { label: "Vue", value: "value5" },
];

export const ExpandableCheckboxGroupDemo = () => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  return (
    <ExpandableCheckboxGroup
      legend="Framework"
      maxVisible={3}
      options={options}
      selectedOptions={selectedOptions}
      onOptionChange={(option) =>
        setSelectedOptions((current) =>
          current.includes(option)
            ? current.filter((value) => value !== option)
            : [...current, option],
        )
      }
    />
  );
};
