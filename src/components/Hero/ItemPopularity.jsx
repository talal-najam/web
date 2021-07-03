import React from 'react';
import { connect } from 'react-redux';
import { bool, func, shape } from 'prop-types';
import itemIds from 'dotaconstants/build/item_ids.json';
import styled from 'styled-components';
import { getHeroItemPopularity } from '../../actions';
import Table from '../Table';
import MatchupsSkeleton from '../Skeletons/MatchupsSkeleton';
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
`;

const itemsTd = (row) => {
  const itemArray = row.items
    .sort((a, b) => {
      return parseFloat(b.itemCount) - parseFloat(a.itemCount);
    })
    .map((itemRow) => {
      const itemName = itemIds[itemRow.itemId];
      return inflictorWithValue(itemName, itemRow.itemCount);
    });

  return (
    <StyledDivClearBoth>
      {itemArray && <div>{itemArray}</div>}
    </StyledDivClearBoth>
  );
};

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

  massageData = (data, strings) => {
    const resultData = [];

    Object.keys(data).forEach((timeKey) => {
      const result = {};
      result.timing = strings[`heading_${timeKey}`];
      result.items = [];
      Object.keys(data[timeKey]).forEach((itemId) => {
        const itemCount = data[timeKey][itemId];
        result.items.push({
          itemId,
          itemCount,
        });
      });

      resultData.push(result);
    });

    return resultData;
  };


  render() {
    const { isLoading, strings, data } = this.props;
    const items = this.massageData(data, strings);

    if (isLoading) {
      return <MatchupsSkeleton />;
    }
    //todo: work on these columns
    const cols = [
      {
        displayName: strings.th_items,
        tooltip: strings.tooltip_items,
        field: 'timing',
        width: 240,
      },
      {
        displayName: strings.th_items,
        tooltip: strings.tooltip_items,
        field: 'items',
        width: 240,
        displayFn: itemsTd,
      },
    ];

    return (
      <div>
        <Table
          data={items}
          columns={cols}
          heading="Items"
          // hoverRowColumn
        />
      </div>
    );

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
