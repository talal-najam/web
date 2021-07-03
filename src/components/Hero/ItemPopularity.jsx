import React from 'react';
import { connect } from 'react-redux';
import { bool, func, shape } from 'prop-types';
import itemIds from 'dotaconstants/build/item_ids.json';
import styled from 'styled-components';
import { getHeroItemPopularity } from '../../actions';
import Table from '../Table';
import MatchupsSkeleton from '../Skeletons/MatchupsSkeleton';
import { getOrdinal } from '../../utility';
import { inflictorWithValue } from '../Visualizations';
import constants from '../constants';

// [ ] todo: update all tab strings for all json values
// [x] todo: check whether the Heading subtitle is public or pro -
// [ ] todo: consider renaming to just Items to stay consistent
// [x] todo: add custom skeleton for this component

export const StyledDivClearBoth = styled.div`
  min-width: 240px;
  > div {
    clear: both;
  }
`;

export const StyledItemContainer = styled.div`
  min-width: 240px;
  background-color: ${constants.defaultPrimaryColorSolid};
  padding: 1rem 2rem;
§`;

class ItemPopularity extends React.Component {
  static propTypes = {
    isLoading: bool,
    onGetHeroItemPopularity: func,
    strings: shape({}),
    data: shape({}),
  };

  componentDidMount() {
    const { onGetHeroItemPopularity, match } = this.props;

    if (match.params && match.params.heroId) {
      onGetHeroItemPopularity(match.params.heroId);
    }
  }

  massageData = (data) => {
    const result = {};

    // Replace item id with name for sorting
    Object.keys(data).forEach((timing) => {
      result[timing] = {};
      Object.keys(data[timing]).forEach((itemId) => {
        const itemName = itemIds[itemId];
        const itemCount = data[timing][itemId];
        result[timing][itemName] = itemCount;
      });
    });

    // Sorting according to buy count
    Object.keys(result).forEach((gametime) => {
      const nestedobj = result[gametime];
      const sortable = Object.fromEntries(
        Object.entries(nestedobj).sort(([, a], [, b]) => b - a)
      );
      result[gametime] = sortable;
    });

    // Render item with icons
    const finalResult = {};

    Object.keys(result).forEach((timing) => {
      finalResult[timing] = [];
      Object.keys(result[timing]).forEach((itemName) => {
        const itemCount = result[timing][itemName];
        finalResult[timing].push(inflictorWithValue(itemName, itemCount));
      });
    });

    return finalResult;
  };

  renderTable() {
    const { data, strings } = this.props;
    const res = [];

    const itemsObject = this.massageData(data);

    Object.keys(itemsObject).map((timeWindow) => {
      return res.push(
        <div>
          <h3>{strings[`heading_${timeWindow}`]}</h3>
          {itemsObject[timeWindow]}
        </div>
      );
    });

    return <div>{res}</div>;
  }

  render() {
    const { isLoading } = this.props;

    if (isLoading) {
      return <MatchupsSkeleton />;
    }

    return <StyledItemContainer>{this.renderTable()}</StyledItemContainer>;
  }
}

const mapDispatchToProps = {
  onGetHeroItemPopularity: getHeroItemPopularity,
};

const mapStateToProps = ({ app }) => ({
  isLoading: app.heroItemPopularity.loading,
  data: app.heroItemPopularity.data,
  strings: app.strings,
});

export default connect(mapStateToProps, mapDispatchToProps)(ItemPopularity);
