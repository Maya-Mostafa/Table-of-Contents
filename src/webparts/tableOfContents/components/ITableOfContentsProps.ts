import { IReadonlyTheme } from '@microsoft/sp-component-base';

export interface ITableOfContentsProps {

  hideTitle: boolean;
  titleText: string;

  searchText: boolean;
  searchMarkdown: boolean;
  searchCollapsible: boolean;

  showHeading2: boolean;
  showHeading3: boolean;
  showHeading4: boolean;
  showHeading5: boolean;

  previousPageText: string;
  showPreviousPageLinkTitle: boolean;
  showPreviousPageLinkAbove: boolean;
  showPreviousPageLinkBelow: boolean;

  enableStickyMode: boolean;
  webpartId: string;

  hideInMobileView: boolean;

  themeVariant: IReadonlyTheme | undefined;

  listStyle: string;

  theme: string;
  wpStyle: string;
  collapsibleState: string;
  verticalToRight: boolean;
  addScrollToTop: boolean;
  backgroundColor: string;
  activeLinkBackgroundColor: string;

  titleColor: string;
  titleSize: number;
  headingColor: string;
  headingSize: number;
  borderColor: string;
  borderRoundness: number;
  borderSize: number;
  enableShadow: boolean;
}