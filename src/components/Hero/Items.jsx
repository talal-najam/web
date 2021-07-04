import React from 'react';
import { connect } from 'react-redux';
import { bool, func, shape, string } from 'prop-types';
import itemIds from 'dotaconstants/build/item_ids.json';
import { getHeroItemPopularity } from '../../actions';
import Table from '../Table';
import MatchupsSkeleton from '../Skeletons/MatchupsSkeleton';
import { inflictorWithValue } from '../Visualizations';
import ErrorBox from '../Error/ErrorBox';

const itemsTd = (row) => {
  const itemArray = row.items
    .sort((a, b) => {
      return b.itemCount - a.itemCount;
    })
    .map((itemRow) => {
      const itemName = itemIds[itemRow.itemId];
      return inflictorWithValue(itemName, itemRow.itemCount);
    });

  return <>{itemArray && <div>{itemArray}</div>}</>;
};

const getItemColumns = (strings) => {
  const cols = [
    {
      displayName: strings.th_time,
      tooltip: strings.tooltip_time,
      field: 'timing',
      width: 240,
    },
    {
      displayName: strings.th_items,
      tooltip: strings.tooltip_items_popularity,
      field: 'items',
      width: 800,
      displayFn: itemsTd,
    },
  ];

  return cols;
};

class ItemPopularity extends React.Component {
  static propTypes = {
    isLoading: bool,
    onGetHeroItemPopularity: func,
    strings: shape({}),
    data: shape({}),
    heroName: string
  };

  componentDidMount() {
    const { onGetHeroItemPopularity, match } = this.props;

    if (match.params && match.params.heroId) {
      onGetHeroItemPopularity(match.params.heroId);
    }
  }

  getItemRows = (data, strings) => {
    const result = [];

    Object.keys(data).forEach((timeKey) => {
      const row = {};
      row.timing = strings[`heading_${timeKey}`];
      row.items = [];
      Object.keys(data[timeKey]).forEach((itemId) => {
        const itemCount = data[timeKey][itemId];
        row.items.push({
          itemId,
          itemCount,
        });
      });

      result.push(row);
    });

    return result;
  };

  render() {
    const { isLoading, strings, data, heroName } = this.props;
    const itemRows = this.getItemRows(data, strings);
    
    // If no pro data is available e.g. new hero not added to captains mode yet
    const isDataAvailable = itemRows.length > 0 && itemRows[0].items.length > 0; 
    const errorText = `${heroName}'s items from professional matches not found...`;

    if (isLoading) {
      return <MatchupsSkeleton />;
    }

    if (!isDataAvailable) {
      return <ErrorBox text={errorText} />;
    }

    return (
      <div>
        <Table
          data={itemRows}
          columns={getItemColumns(strings)}
          heading="Items"
          hoverRowColumn
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
