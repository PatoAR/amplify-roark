import { Autocomplete } from "@aws-amplify/ui-react";

const HeaderSearchBar = () => {
  return (
    <div className="header-search-bar">
      <Autocomplete
        label="Autocomplete"
        options={[
          { id: "companies", label: "Companies" },
        ]}
        placeholder="Search here..."
        size="small"
      />
    </div>
  );
};

export default HeaderSearchBar;