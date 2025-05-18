import { Autocomplete } from "@aws-amplify/ui-react";

const HeaderSearchBar = () => {
  return (
    <div className="header-search-bar">
      <Autocomplete
        label="Autocomplete"
        options={[
          { id: "traffic", label: "Traffic" },
          { id: "sales", label: "Sales" },
          { id: "users", label: "Users" },
          { id: "tables", label: "Tables" },
          { id: "forms", label: "Forms" },
        ]}
        placeholder="Search here..."
        size="small"
      />
    </div>
  );
};

export default HeaderSearchBar;