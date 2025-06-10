import { Flex } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import "./Header.css";

import Logo from "../../assets/react.svg";
import HeaderNav from "./HeaderNav";
import HeaderSearchBar from "./HeaderSearchBar";

const Header = () => {
  return (
    <div className="header">
      <Flex
        direction="row"
        alignItems="center"
        wrap="nowrap"
        gap="1rem"
        justifyContent="space-between"
      >
        <div className="header-left">
          <div className="header-logo">
            <Link to="/">
              <img src={Logo} alt="Logo" />
            </Link>
          </div>
        </div>

        <div className="header-center">
          <HeaderSearchBar />
        </div>

        <div className="header-right">
          <HeaderNav />
        </div>
      </Flex>
    </div>
  );
};

export default Header;