import { Flex } from "@aws-amplify/ui-react";
import { Link } from "react-router-dom";
import "./Header.css";

import Logo from "/PerkinsLogo_Base_Transp.png";
import HeaderNav from "./HeaderNav";
import HeaderSearchBar from "./HeaderSearchBar";
import { useSubscriptionManager } from "../../hooks/useSubscriptionManager";

const Header = () => {
  const {
    shouldShowWarning,
  } = useSubscriptionManager();

  const handleUpgradeClick = () => {
    window.location.href = '/settings/referral';
  };

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
          {/* Minimalistic Subscription Warning */}
          {shouldShowWarning() && (
            <Flex alignItems="center" gap="small">
              <div className="warning-icon" onClick={handleUpgradeClick}>
                ⚠️
              </div>
            </Flex>
          )}
          <HeaderNav />
        </div>
      </Flex>
    </div>
  );
};

export default Header;