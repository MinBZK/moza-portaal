/**
 * Puts the page in focus mode (pattern "Focus op een enkele taak"): on a wider
 * screen the navigation, breadcrumb and most of the footer fold away and the
 * content spans all 12 columns. rhc.css reacts to this marker, so the page
 * renders in focus mode right away. FocusModeSwitch turns it off and on.
 */
const CollapsibleNavigation = () => (
  <span className="rhc-mox-collapsible-navigation" hidden />
);

export default CollapsibleNavigation;
