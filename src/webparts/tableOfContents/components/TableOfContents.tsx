import * as React from 'react';
import styles from './TableOfContents.module.scss';
import { ITableOfContentsProps } from './ITableOfContentsProps';
import { ITableOfContentsState } from './ITableOfContentsState';
import { escape, times } from '@microsoft/sp-lodash-subset';
import * as strings from "TableOfContentsWebPartStrings";
import { Icon } from '@fluentui/react';
import LinkElement from './LinkElement/LinkElement';

/**
 * Describes a link for a header
 */
export interface Link {
  /**
   * The Source html element.
   */
  element: HTMLElement | undefined;
  /**
   * Child nodes for the link.
   */
  childNodes: Link[];
  /**
   * Parent link. Undefined for the root link.
   */
  parent: Link | undefined;
}

export default class TableOfContents extends React.Component<ITableOfContentsProps, ITableOfContentsState> {
  private static timeout = 500;

  private static h2Tag = "h2";
  private static h3Tag = "h3";
  private static h4Tag = "h4";
  private static h5Tag = "h5";

  /**
   * Create a state for the history count. 
   * This is required to make sure we go back to the correct page when the back to previous page link is clicked.
   */
  constructor(props: ITableOfContentsProps) {
    super(props);
    this.state = {
      historyCount: -1,
      isActiveLink : false,
      activeLink: ""
    };
  }

  /**
   * Gets a nested list of links based on the list of headers specified.
   * @param headers List of HtmlElements for H2, H3, and H4 headers.
   */
  private getLinks(headers: HTMLElement[]): Link[] {
    // create a root link that will be a root for links' tree
    const root: Link = { childNodes: [], parent: undefined, element: undefined };

    let prevLink: Link | null = null;

    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const link: Link = { childNodes: [], parent: undefined, element: header };

      if (i === 0) {
        // the first header is always added as a child of the root
        link.parent = root;
        root.childNodes.push(link);
      } else {
        const prevHeader = headers[i - 1];

        // compare the current header and the previous one to define where to add new link
        const compare = this.compareHeaders(header.tagName, prevHeader.tagName);

        if (compare === 0) {
          // if headers are on the same level, add header to the same parent
          link.parent = prevLink.parent;
          prevLink.parent.childNodes.push(link);
        } else if (compare < 0) {

          let targetParent = prevLink.parent;
          // if current header bigger than the previous one, go up in the hierarchy to find a place to add link
          // go up in the hierarchy of links until a link with bigger tag is found or until the root link found
          // i.e. for H4 look for H3 or H2, for H3 look for H2, for H2 look for the root.
          while ((targetParent != root) && (this.compareHeaders(header.tagName, targetParent.element.tagName) <= 0)) {
            targetParent = targetParent.parent;
          }

          link.parent = targetParent;
          targetParent.childNodes.push(link);
        } else {
          // if current header is smaller thab the previous one, add link for it as a child of the previous link
          link.parent = prevLink;
          prevLink.childNodes.push(link);
        }
      }

      prevLink = link;
    }

    // return list of links for top-level headers
    return root.childNodes;
  }

  /**
   * Compares two header tags by their weights.
   * The function is used to compare the size of headers (e.g. should H3 go under H2?)
   * @param header1
   * @param header2
   */
  private compareHeaders(header1: string, header2: string): number {
    return this.getHeaderWeight(header1) - this.getHeaderWeight(header2);
  }

  /**
   * Returns a digital weight of a tag. Used for comparing header tags.
   * @param header
   */
  private getHeaderWeight(header: string): number {
    switch (header.toLowerCase()) {
      case (TableOfContents.h2Tag):
        return 2;
      case (TableOfContents.h3Tag):
        return 3;
      case (TableOfContents.h4Tag):
        return 4;
      case (TableOfContents.h5Tag):
        return 5;
      default:
        throw new Error('Unknown header: ' + header);
    }
  }

  /**
   * Returns html elements in the current page specified by the query selector.
   */
  private getHtmlElements(querySelector: string): HTMLElement[] {
    if (querySelector.length === 0) {
      return [];
    } else {
      const elements = document.querySelectorAll(querySelector);
      const htmlElements: HTMLElement[] = [];

      for (let i = 0; i < elements.length; i++) {

        // While in edit mode Section headers are not headers, but text areas. This converts them to H2 tags
        if (elements[i].tagName === "TEXTAREA") {
          let temp = document.createElement('h2')
          temp.innerHTML = elements[i].innerHTML
          htmlElements.push(temp)
        }
        else {
          htmlElements.push(elements[i] as HTMLElement);
        }

      }
      return htmlElements;
    }
  }

  /**
   * Returns a query selector based on the specified props
   * @param props
   */
  private getQuerySelector(props: ITableOfContentsProps) {
    let queryParts = [];
    let queryItems = [];

    if (this.props.searchText) {
      queryItems.push('.cke_editable', '.ck-content');
    }

    if (this.props.searchCollapsible) {
      queryItems.push('[data-automation-id*="CollapsibleLayer-Heading"]', '[data-automation-id*="CollapsibleLayer-TitleInput"]');
    }

    if (this.props.searchMarkdown) {
      queryItems.push('[data-sp-feature-tag*="Markdown"]');
    }

    if (props.showHeading2) {
      for (let i = 0; i < queryItems.length; i++) {

        if (queryItems[i] === '[data-automation-id*="CollapsibleLayer-TitleInput"]') {
          queryParts.push(queryItems[i]);
        }
        else {
          queryParts.push(queryItems[i] + " " + TableOfContents.h2Tag);
        }
      }
    }

    if (props.showHeading3) {
      for (let i = 0; i < queryItems.length; i++) {
        queryParts.push(queryItems[i] + " " + TableOfContents.h3Tag);
      }
    }

    if (props.showHeading4) {
      for (let i = 0; i < queryItems.length; i++) {
        queryParts.push(queryItems[i] + " " + TableOfContents.h4Tag);
      }
    }

    if (props.showHeading5) {
      for (let i = 0; i < queryItems.length; i++) {
        queryParts.push(queryItems[i] + " " + TableOfContents.h5Tag);
      }
    }

    return queryParts.join(',');
  }

  /**
   * Filters elements with empty text.
   * @param element
   */
  private filterEmpty(element: HTMLElement): boolean {
    return element.innerText.trim() !== '';
  }

  /**
   * Filters elements that are inside <aside> tag and thus not related to a page.
   * @param element
   */
  private filterAside(element: HTMLElement): boolean {
    let inAsideTag = false;

    let parentElement = element.parentElement;

    while (parentElement) {
      if (parentElement.tagName.toLocaleLowerCase() === 'aside') {
        inAsideTag = true;
        break;
      }

      parentElement = parentElement.parentElement;
    }

    return !inAsideTag;
  }

  /**
   * Filters elements that have the data attrribute of 'data-toc-ignore' and thus should be ignored.
   * @param element
   */
  private filterTocIgnore(element: HTMLElement): boolean {
    return !(element.getAttribute("data-toc-ignore"));
  }

  /**
   * Filters elements that have been set with a sytle of 'display: none'
   * @param element
   */
  private filterStyleDisplayNone(element: HTMLElement): boolean {
    let styleDisplayNone = false;

    let parentElement = element.parentElement;

    while (parentElement) {
      if (parentElement.style.display.toLocaleLowerCase() === 'none') {
        styleDisplayNone = true;
        break;
      }

      parentElement = parentElement.parentElement;
    }

    return !styleDisplayNone;
  }

  /**
   * Returns a click handler that scrolls a page to the specified element.
   */
  private scrollToHeader = (target: HTMLElement, index: number) => {
    return (event: React.SyntheticEvent) => {
      //decrement the history count to allow the return to previous page to work correctly
      const temp = this.state.historyCount - 1;
      this.setState({ historyCount: temp});
      this.setState({activeLink: target.innerText+index});
      event.preventDefault();
      document.location.hash = target.id;
      target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    };
  }

  /**
   * Creates a list of components to display from a list of links.
   * @param links
   */
  private renderLinks(links: Link[], listStyle: string): JSX.Element[] {
    // for each link render a <li> element with a link. If the link has got childNodes, additionaly render <ul> with child links.
    const elements = links.map((link, index) => {
      return (
        <LinkElement 
          key={index} 
          link={link} 
          clickHandler={this.scrollToHeader(link.element, index)}
          index={index}
          collapsibleState={this.props.collapsibleState}
          activeClass={this.state.activeLink === link.element.innerText+index ? styles.activeLink : ""}
          activeLinkColor={this.props.activeLinkBackgroundColor}
          headingSize = {this.props.headingSize}
          >
          {link.childNodes.length > 0 ? (<ul className={styles.childList} style={{ listStyleType: listStyle }}>{this.renderLinks(link.childNodes, listStyle)}</ul>) : ''}
        </LinkElement>

        // <li key={index} className={link.childNodes.length > 0 ? styles.linkHasChild : styles.linkNoChild}>
        //   <a 
        //     className={this.state.activeLink === link.element.innerText+index ? styles.activeLink : ""} 
        //     onClick={this.scrollToHeader(link.element, index)} 
        //     href={'#' + link.element.id}>
        //       {link.childNodes.length > 0 && initExpanded && <span className={styles.colExpIcon}><Icon iconName='ChevronDown' /></span>}
        //       {link.childNodes.length > 0 && !initExpanded && <span className={styles.colExpIcon}><Icon iconName='ChevronRight' /></span>}
        //       {link.element.innerText}
        //   </a>
        //   {link.childNodes.length > 0 ? (<ul className={styles.childList} style={{ listStyleType: listStyle }}>{this.renderLinks(link.childNodes, listStyle, initExpanded)}</ul>) : ''}
        // </li>
      );
    });

    return elements;
  }

  private handleScroll = () => {
    console.log("scrolling!");
  }

  /**
   * Force the component to re-render with a specified interval.
   * This is needed to get valid id values for headers to use in links. Right after the rendering headers won't have valid ids, they are assigned later once the whole page got rendered.
   * The component will display the correct list of headers on the first render and will be able to process clicks (as a link to an HTMLElement is stored by the component).
   * Once valid ids got assigned to headers by SharePoint code, the component will get valid ids for headers. This way a link from ToC can be copied by a user and it will be a valid link to a header.
   */
  public componentDidMount() {
    this.setState({});
    console.log("componentDidMount");
    document.querySelector('.commandBarWrapper').addEventListener('scroll', this.handleScroll);

    // setInterval(() => {
    //   this.setState({});
    // }, TableOfContents.timeout);

  }

  public componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  

  /**
   * Event for the back to previous page link. 
   * It uses the history count to work out how many pages to go back, as each click to a header results in history
   */
  public backToPreviousPage() {
    window.history.go(this.state.historyCount);
  }

  /**
   * Render the back to previous link
   */
  private renderBackToPreviousLink = (listStyle: string): JSX.Element => {
    return (
      <div className={styles.backItem} ><ul style={{ listStyleType: listStyle }}><li><a href="#" onClick={() => this.backToPreviousPage()}>{this.props.previousPageText ? this.props.previousPageText : strings.previousPageDefaultValue}</a></li></ul></div>
    );
  }

  /**
   * Modify the CSS of the appropriate HTML elements based on the wepart ID to enable sticky mode.
   * This does involve modifying HTML elements outside of the webpart, so may well break in the furture if Microsoft change their HTML\CSS etc.
   */
  private configureSticky() {

    const HTMLElementSticky: HTMLElement = document.querySelector("[id='" + this.props.webpartId + "']");
    if (HTMLElementSticky != null) {
      if (this.props.enableStickyMode && window.innerWidth > 1024) {
        
        // one-third column
        HTMLElementSticky.parentElement.style.position = "Sticky";
        HTMLElementSticky.parentElement.style.top = "0px";

        // vertical section
        HTMLElementSticky.parentElement.parentElement.parentElement.style.position = "Sticky";
        HTMLElementSticky.parentElement.parentElement.parentElement.style.top = "0px";
      }
      else {

        HTMLElementSticky.parentElement.parentElement.parentElement.style.position = "";
        HTMLElementSticky.parentElement.parentElement.parentElement.style.top = "";
      }
    }
  }

  private configureVerticalColumn(){
    const HTMLElementCanvas: HTMLElement = document.querySelector(".Canvas--withLayout");
    if (HTMLElementCanvas != null) {
      if (this.props.verticalToRight && window.innerWidth > 1024) {
        HTMLElementCanvas.style.flexDirection = "row-reverse";
      }
    }
  }


  public render(): JSX.Element {
    
    let collapsibleStyle = "";
    if (this.props.collapsibleState === 'expandedState') collapsibleStyle = styles.listInitExpanded;
    if (this.props.collapsibleState === 'collapsedState') collapsibleStyle = styles.listInitCollapsed;

    // get headers, then filter out empty and headers from <aside> tags
    const listStyle = escape(this.props.listStyle) === "default" ? "" : this.props.listStyle;
    const querySelector = this.getQuerySelector(this.props);
    const headers = this.getHtmlElements(querySelector).filter(this.filterEmpty).filter(this.filterAside).filter(this.filterTocIgnore).filter(this.filterStyleDisplayNone);
    // create a list of links from headers
    const links = this.getLinks(headers);
    // create components from a list of links
    const toc = (
      <ul className={`${styles.mainList} ${collapsibleStyle}`} 
        style={{ 
          listStyleType: listStyle, 
          backgroundColor: this.props.backgroundColor,  
          borderRadius: this.props.borderRoundness, 
          borderColor: this.props.borderColor,
          borderStyle: "solid",
          borderWidth: this.props.borderSize,
          color: this.props.headingColor,
          fontSize: this.props.headingSize,
          boxShadow: this.props.enableShadow ? "0px 1px 5px 2px #ccc" : "none",
        }}
        >
          {this.renderLinks(links, listStyle)}
      </ul>
    );
    // create previous page link
    const previousPageTitle = this.props.showPreviousPageLinkTitle && !this.props.hideTitle ? (this.renderBackToPreviousLink(listStyle)) : null;
    const previousPageAbove = this.props.showPreviousPageLinkAbove ? (this.renderBackToPreviousLink(listStyle)) : null;
    const previousPageBelow = this.props.showPreviousPageLinkBelow ? (this.renderBackToPreviousLink(listStyle)) : null;
    // add CSS class to hide in mobile view if needed
    const hideInMobileViewClass = this.props.hideInMobileView ? (styles.hideInMobileView) : '';
    // add CSS class to hide title if requested
    const titleClass = this.props.hideTitle ? (styles.hideTitle) : "cke_editableX h2 " + styles.title;
    // set title text
    const titleText = this.props.titleText ? this.props.titleText : strings.titleDefaultValue;
    // set Sticky parameters
    this.configureSticky();
    // set vertical column direction
    this.configureVerticalColumn();

    // const webpartStyle = this.props.wpStyle ? this.props.wpStyle : 'wpStylePlain';    

    return (
      <section 
        // style={{backgroundColor: this.props.backgroundColor}}
        className={`${styles.tableOfContents} ${this.props.wpStyle === 'wpStyleBoxed' && styles.wpStyleBoxed} ${this.props.wpStyle === 'wpStyleLined' && styles.wpStyleLined} `}
        // style={{
        //   borderRadius: this.props.borderRoundness, 
        //   borderColor: this.props.borderColor,
        //   borderWidth: this.props.borderSize,
        //   color: this.props.headingColor,
        //   fontSize: this.props.headingSize
        // }}        
        >
        <div className={hideInMobileViewClass}>
          <nav>
            {previousPageTitle}
            <div className={titleClass}>
              <h2 style={{fontSize: this.props.titleSize, color: this.props.titleColor}} data-toc-ignore="true">{titleText}</h2>
            </div>
            {previousPageAbove}
            {toc}
            {previousPageBelow}
          </nav>
        </div>
        {this.props.addScrollToTop && 
          <div className={styles.scrollToTop}>
            <a title="Scroll to Top" onClick={this.scrollToHeader(links[0].element, 0)}><Icon iconName='SortUp' /></a>
          </div>
        }
      </section>
    );
  }
}
