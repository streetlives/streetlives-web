import React from "react";
import Icon from "../../../components/icon";

function ResultsBar({
  isSearching,
  filterString,
  hasResults,
  filters,
  clearResults,
}) {
  const noResultsInfo = () => {
    const searchTerm = filters.searchString;
    // No results after searching through the searchbar
    if (searchTerm && searchTerm.length && !hasResults) {
      const wordCount = searchTerm.split(" ").length;
      return (
        <div className="resultsBarInner">
          {wordCount > 3 ? (
            <div>
              Nothing matched for "{searchTerm}", try using{" "}
              <span className="font-weight-bold">fewer search words</span>.
            </div>
          ) : (
            <div>
              Nothing matched for "{searchTerm}".
              <span className="font-weight-bold"> Try another word.</span>
            </div>
          )}
          <div onClick={clearResults} className="iconWrapper">
            <Icon name="times"/>
          </div>
        </div>
      );
    } else if (
      filters.advancedFilters &&
      Object.keys(filters.advancedFilters) &&
      !hasResults
    ) {
      // user applied filters after selecting one of the four catagories
      // and we returned no results.
      return (
        <div>
          Nothing matched, try using{" "}
          <span className="font-weight-bold">different filters.</span>
        </div>
      );
    } else {
      // All other cases
      // For example, user gets no results after going through clothing eligibility flow.
      return (
        <div className="resultsBarInner">
          <div>
            Nothing matched. Try a{" "}
            <span className="font-weight-bold">more general search.</span>
          </div>
          <div onClick={clearResults} className="iconWrapper">
            <Icon name="times"/>
          </div>
        </div>
      );
    }
  };

  const displayContent = () => {
    if (isSearching) {
      // loading state
      return <div>Loading results...</div>;
    } else if (hasResults) {
      // results found
      return (
        <div>
          Showing results for
          <span className="font-weight-bold ml-1">{filterString}</span>
        </div>
      );
    } else {
      //different handling of no results

      return noResultsInfo();
    }
  };

  return <div className="resultsBar">{displayContent()}</div>;
}

export default ResultsBar;
