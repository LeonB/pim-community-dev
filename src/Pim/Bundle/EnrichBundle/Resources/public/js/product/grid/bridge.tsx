import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider, connect } from 'react-redux';
const __ = require('oro/translator');
import { ProductInterface } from 'pimfront/product/domain/model/product';
const userContext = require('pim/user-context');
import { updateResultsAction } from 'pimfront/product-grid/application/action/search';
import { updateLocales } from 'pimfront/app/application/action/locale';
import { State } from 'pimfront/grid/application/reducer/reducer';
import store from 'pimfront/product-grid/application/store/main';
import {
  catalogLocaleChanged,
  catalogChannelChanged,
  uiLocaleChanged
} from 'pimfront/app/domain/event/user';
import Locale from 'pimfront/app/domain/model/locale';
import LocaleSwitcher from 'pimfront/app/application/component/locale-switcher';

const redirectToProduct = (product: ProductInterface) => {
  return {type: 'REDIRECT_TO_ROUTE', route: 'pim_enrich_product_edit', params: {id: product.meta.id}}
}

type GlobalState = State<ProductInterface>;

const GridView = ({items, context, structure, redirectToProduct}: GridViewState & GridDispatch) => {
  const itemViews = items.map((item: ProductInterface) => (
    <tr key={item.identifier} className="AknGrid-bodyRow row-click-action" onClick={() => redirectToProduct(item)}>
      <td className="AknGrid-bodyCell AknGrid-bodyCell--tight AknGrid-bodyCell--checkbox select-row-cell"></td>
      <td className="AknGrid-bodyCell string-cell" data-column="identifier">{item.identifier}</td>
      <td className="AknGrid-bodyCell string-cell">
        <img className="AknGrid-image" src="/media/show/{item.meta.image}/thumbnail_small" title="" />
      </td>
      <td className="AknGrid-bodyCell AknGrid-bodyCell--highlight" data-column="label">{item.getLabel('ecommerce', 'en_US')}</td>
      <td className="AknGrid-bodyCell string-cell" data-column="family">{item.family}</td>
      <td className="AknGrid-bodyCell string-cell">
        <div className="AknBadge AknBadge--medium AknBadge--disabled status-disabled"><i className="AknBadge-icon icon-status-disabled icon-circle"></i>Disabled</div>
      </td>
      <td className="AknGrid-bodyCell string-cell">
        <span className="AknBadge AknBadge--medium AknBadge--warning">50%</span>
      </td>
      <td className="AknGrid-bodyCell string-cell" data-column="created">01/05/2018</td>
      <td className="AknGrid-bodyCell string-cell" data-column="updated">01/09/2018</td>
      <td className="AknGrid-bodyCell string-cell">N/A</td>
      <td className="AknGrid-bodyCell AknGrid-bodyCell--actions action-cell">
        <div className="AknButtonList AknButtonList--right"></div>
      </td>
    </tr>
  ));

  const Sidebar = () => {
    return (
      <div className="AknColumn">
        <div className="AknColumn-inner">
          <div className="AknColumn-innerTop">
            <div className="AknColumn-part">
              <div className="AknDropdown AknFilterBox-filterContainer">
                <div className="AknFilterBox-filter filter-select" data-toggle="dropdown">
                  <span className="AknFilterBox-filterLabel">Channel</span>
                  <span className="AknFilterBox-filterCriteria value">Ecommerce</span>
                  <span className="AknFilterBox-filterCaret"></span>
                </div>
              </div>
              <div className="AknColumn-block">
                <LocaleSwitcher locale={context.locale} locales={structure.locales}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    )};

  return (
    <div className="AknDefault-contentWithColumn">
      <div className="AknDefault-contentWithBottom">
        <div className="AknGridContainer AknGridContainer--withCheckbox">
          <table className="AknGrid">
            <thead className="AknGrid-header">
              <tr className="AknGrid-bodyRow">
                <th className="AknGrid-headerCell AknGrid-headerCell--checkbox select-all-header-cell"></th>
                <th className="AknGrid-headerCell">{__('ID')} <span className="AknGrid-caret AknCaret caret"></span></th>
                <th className="AknGrid-headerCell"><span>{__('Image')}</span></th>
                <th className="AknGrid-headerCell"><span>{__('Label')}</span></th>
                <th className="AknGrid-headerCell">{__('Family')} <span className="AknGrid-caret AknCaret caret"></span></th>
                <th className="AknGrid-headerCell">{__('Status')} <span className="AknGrid-caret AknCaret caret"></span></th>
                <th className="AknGrid-headerCell">{__('Complete')} <span className="AknGrid-caret AknCaret caret"></span></th>
                <th className="AknGrid-headerCell">{__('Created at')} <span className="AknGrid-caret AknCaret caret"></span></th>
                <th className="AknGrid-headerCell AknGrid-headerCell--descending descending">
                  {__('Updated at')} <span className="AknGrid-caret AknCaret caret"></span>
                </th>
                <th className="AknGrid-headerCell"><span>{__('Variant products')}</span></th>
                <th className="AknGrid-headerCell action-column"></th>
              </tr>
            </thead>
            <tbody className="AknGrid-body">
              {itemViews}
            </tbody>
          </table>
        </div>
      </div>
      <Sidebar />
    </div>
  );
};

interface GridDispatch {
  redirectToProduct: (product: ProductInterface) => void;
}

interface GridViewState {
  items: ProductInterface[];
  context: {
    locale: string;
  };
  structure: {
    locales: Locale[]
  }
}

const Grid = connect(
  (state: GlobalState): GridViewState => {
    const locale = undefined === state.user.catalogLocale ? '' : state.user.catalogLocale;

    return {
      items: state.grid.items,
      context: {
        locale
      },
      structure: {
        locales: state.structure.locales
      }
    };
  },
  (dispatch: any): GridDispatch => {
    return {
      redirectToProduct: (product: ProductInterface) => {
        dispatch(redirectToProduct(product));
      }
    };
  }
)(GridView);

const render = (Component: any) => (DOMElement: HTMLElement) => {
  store.dispatch(catalogLocaleChanged(userContext.get('catalogLocale')));
  store.dispatch(catalogChannelChanged(userContext.get('catalogScope')));
  store.dispatch(uiLocaleChanged(userContext.get('uiLocale')));
  store.dispatch(updateLocales());
  const state = store.getState();
  if (undefined !== state.user.catalogLocale && undefined !== state.user.catalogChannel) {
    store.dispatch(updateResultsAction(state.user.catalogLocale, state.user.catalogChannel));
  }

  return ReactDOM.render(
    <Provider store={store}>
      <Component />
    </Provider>,
    DOMElement as HTMLElement
  );
};

export default render(Grid);