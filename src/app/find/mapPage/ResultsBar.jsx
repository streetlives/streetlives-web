import React from 'react';
import Icon from '../../../components/icon';

class ResultsBar extends React.Component {
  shouldComponentUpdate(nextProps) {
    // this prevents the results bar from updating on map drag
    if (
      this.props.filterString === nextProps.filterString &&
      this.props.isSearching === nextProps.isSearching
    ) {
      return false;
    } else {
      return true;
    }
  }

  noResultsInfo = () => {
    const { hasResults, filters, clearResults } = this.props;
    const searchTerm = filters.searchString;

    // No results after searching through the searchbar
    if (searchTerm && searchTerm.length && !hasResults) {
      const wordCount = searchTerm.split(' ').length;
      return (
        <div className='resultsBarInner'>
          {wordCount >= 3 ? (
            <div>
              Nothing matched for '{searchTerm.trim()}', try using{' '}
              <span className='font-weight-bold'>fewer search words</span>.
            </div>
          ) : (
            <div>
              Nothing matched for '{searchTerm.trim()}'.
              <span className='font-weight-bold'> Try another word.</span>
            </div>
          )}
          <div onClick={clearResults} className='iconWrapper'>
            <Icon name='times' />
          </div>
        </div>
      );
    } else if (
      filters.advancedFilters &&
      Object.keys(filters.advancedFilters) &&
      !hasResults
    ) {
      // Handle no results after using filters
      return (
        <div>
          Nothing matched, try using{' '}
          <span className='font-weight-bold'>different filters.</span>
        </div>
      );
    } else {
      // All other cases
      // For example, user gets no results after going through clothing eligibility flow.
      return (
        <div className='resultsBarInner'>
          <div>
            Nothing matched. Try a{' '}
            <span className='font-weight-bold'>more general search.</span>
          </div>
          <div onClick={clearResults} className='iconWrapper'>
            <Icon name='times' />
          </div>
        </div>
      );
    }
  };

  displayContent = () => {
    const { isSearching, hasResults, filterString } = this.props;

    if (isSearching) {
      // loading state
      return <div>Loading results...</div>;
    } else if (hasResults) {
      // results found
      return (
        <div>
          Showing results for
          <span className='font-weight-bold ml-1'>{filterString}</span>
        </div>
      );
    } else {
      // handle no results
      return this.noResultsInfo();
    }
  };

  render() {
    return <div className='resultsBar'>{this.displayContent()}</div>;
  }
}

export default ResultsBar;
