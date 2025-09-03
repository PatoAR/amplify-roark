import { Flex } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import "./Header.css";

import Logo from "/PerkinsLogo_Base_Transp.png";
import HeaderNav from "./HeaderNav";
import HeaderSearchBar from "./HeaderSearchBar";

const Header = () => {

  return (
    <div className="header">
      <Flex
        direction="row"
        alignItems="center"
        wrap="nowrap"
        justifyContent="space-between"
      >
        <div className="header-left">
          <Link to="/" className="header-logo" aria-label="Home">
            <img src={Logo} alt="Company Logo" />
          </Link>
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