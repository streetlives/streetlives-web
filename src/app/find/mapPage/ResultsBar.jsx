import React from 'react';
import Icon from '../../../components/icon';

function ResultsBar({
  clearResults, filters, filterString, isSearching, hasResults,
}) {
  const noResultsInfo = () => {
    const searchTerm = filters.searchString;

    // No results after searching through the searchbar
    if (searchTerm && searchTerm.length) {
      const trimmedSearch = searchTerm.trim();
      const wordCount = trimmedSearch.split(/\s+/).length;

      return (
        <div className="resultsBarInner">
          {wordCount >= 3 ? (
            <div>
              Nothing matched for &apos;{trimmedSearch}&apos;,
              try using{' '}
              <span className="font-weight-bold">fewer search words</span>.
            </div>
          ) : (
            <div>
              Nothing matched for &apos;{trimmedSearch}&apos;.
              <span className="font-weight-bold"> Try another word.</span>
            </div>
          )}
          <div onClick={clearResults} className="iconWrapper">
            <Icon name="times" />
          </div>
        </div>
      );
    } else if (
      filters.advancedFilters &&
      Object.keys(filters.advancedFilters)
    ) {
      // Handle no results after using filters
      return (
        <div>
          Nothing matched, try using{' '}
          <span className="font-weight-bold">different filters.</span>
        </div>
      );
    }

    // All other cases
    // For example, user gets no results after going through clothing eligibility flow.
    return (
      <div className="resultsBarInner">
        <div>
          Nothing matched. Try a{' '}
          <span className="font-weight-bold">more general search.</span>
        </div>
        <div onClick={clearResults} className="iconWrapper">
          <Icon name="times" />
        </div>
      </div>
    );
  };

  const displayContent = () => {
    if (isSearching) {
      return <div>Loading results...</div>;
    } else if (hasResults) {
      return (
        <div>
          Showing results for
          <span className="font-weight-bold ml-1">{filterString}</span>
        </div>
      );
    }

    return noResultsInfo();
  };

  return <div className="resultsBar">{displayContent()}</div>;
}

export default ResultsBar;
