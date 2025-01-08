import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart
} from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneToggle,
  PropertyPaneTextField,
  PropertyPaneLabel,
  PropertyPaneDropdown,
  PropertyPaneLink,
  PropertyPaneSlider
} from "@microsoft/sp-property-pane";
import {
  ThemeProvider,
  ThemeChangedEventArgs,
  IReadonlyTheme
} from '@microsoft/sp-component-base';

import * as strings from 'TableOfContentsWebPartStrings';
import TableOfContents from './components/TableOfContents';
import { ITableOfContentsProps } from './components/ITableOfContentsProps';
import { PropertyFieldColorPicker, PropertyFieldColorPickerStyle } from '@pnp/spfx-property-controls';

export interface ITableOfContentsWebPartProps {
  hideTitle: boolean;
  titleText: string;
  searchText: boolean;
  searchMarkdown: boolean;
  searchCollapsible: boolean;
  showHeading1: boolean;
  showHeading2: boolean;
  showHeading3: boolean;
  showHeading4: boolean;
  showPreviousPageLinkTitle: boolean;
  showPreviousPageLinkAbove: boolean;
  showPreviousPageLinkBelow: boolean;
  previousPageText: string;
  historyCount: number;
  enableStickyMode: boolean;
  hideInMobileView: boolean;
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

  enableInnerScrolling: boolean;
  setHeight: boolean;
  contentsHeight: number;
}

export default class TableOfContentsWebPart extends BaseClientSideWebPart<ITableOfContentsWebPartProps> {

  private _themeProvider: ThemeProvider;
  private _themeVariant: IReadonlyTheme | undefined;

  protected onInit(): Promise<void> {
    // Consume the ThemeProvider service
    this._themeProvider = this.context.serviceScope.consume(ThemeProvider.serviceKey);
    // If it exists, get the theme variant
    this._themeVariant = this._themeProvider.tryGetTheme();
    this.setCSSVariables(this._themeVariant.semanticColors);
    // Register a handler to be notified if the theme variant changes
    this._themeProvider.themeChangedEvent.add(this, this._handleThemeChangedEvent);
    // return super.onInit()
    return super.onInit().then(_ => {
      if (this.properties.searchText === undefined) {
        this.properties.searchText = true;
        this.properties.showHeading4 = true;
      }
    });
  }

  private setCSSVariables(theming: any): any {
    if (!theming) { return null; }
    let themingKeys = Object.keys(theming);
    if (themingKeys !== null) {
      themingKeys.forEach(key => {
        this.domElement.style.setProperty(`--${key}`, theming[key]);
      });
    }
  }

  /**
 * Update the current theme variant reference and re-render.
 *
 * @param args The new theme
 */
  private _handleThemeChangedEvent(args: ThemeChangedEventArgs): void {
    this._themeVariant = args.theme;
    this.setCSSVariables(this._themeVariant.semanticColors);
    this.render();
  }

  public render(): void {
    const element: React.ReactElement<ITableOfContentsProps> = React.createElement(
      TableOfContents,
      {
        themeVariant: this._themeVariant,

        hideTitle: this.properties.hideTitle,
        titleText: this.properties.titleText,

        searchText: this.properties.searchText,
        searchMarkdown: this.properties.searchMarkdown,
        searchCollapsible: this.properties.searchCollapsible,

        showHeading2: this.properties.showHeading1,
        showHeading3: this.properties.showHeading2,
        showHeading4: this.properties.showHeading3,
        showHeading5: this.properties.showHeading4,

        showPreviousPageLinkTitle: this.properties.showPreviousPageLinkTitle,
        showPreviousPageLinkAbove: this.properties.showPreviousPageLinkAbove,
        showPreviousPageLinkBelow: this.properties.showPreviousPageLinkBelow,
        previousPageText: this.properties.previousPageText,

        enableStickyMode: this.properties.enableStickyMode,
        webpartId: this.context.instanceId,

        hideInMobileView: this.properties.hideInMobileView,

        listStyle: this.properties.listStyle,

        theme: this.properties.theme,
        wpStyle: this.properties.wpStyle,
        collapsibleState: this.properties.collapsibleState,
        verticalToRight: this.properties.verticalToRight,
        addScrollToTop: this.properties.addScrollToTop,
        backgroundColor: this.properties.backgroundColor,
        activeLinkBackgroundColor: this.properties.activeLinkBackgroundColor,

        titleColor: this.properties.titleColor,
        titleSize: this.properties.titleSize,
        headingColor: this.properties.headingColor,
        headingSize: this.properties.headingSize,
        borderColor: this.properties.borderColor,
        borderRoundness: this.properties.borderRoundness,
        borderSize: this.properties.borderSize,
        enableShadow: this.properties.enableShadow,

        enableInnerScrolling: this.properties.enableInnerScrolling,
        setHeight: this.properties.setHeight,
        contentsHeight: this.properties.contentsHeight,
      }
    );

    ReactDom.render(element, this.domElement);
  }

  /**
   * Saves new value for the title property.
   */
  /*private handleUpdateProperty = (newValue: string) => {
    this.properties.title = newValue;
  }*/

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let showHeading4: any;
    let showPreviousPageLinkTitle: any;

    if (this.properties.searchMarkdown) {
      showHeading4 = PropertyPaneCheckbox('showHeading4', {
        text: strings.showHeading4FieldLabel
      })
    }
    else {
      showHeading4 = PropertyPaneCheckbox('showHeading4', {
        text: strings.showHeading4FieldLabel,
        disabled: true
      });
    }

    if (this.properties.hideTitle) {
      showPreviousPageLinkTitle = PropertyPaneCheckbox('showPreviousPageLinkTitle', {
        text: strings.showPreviousPageTitleLabel,
        disabled: true
      })
    }
    else {
      showPreviousPageLinkTitle = PropertyPaneCheckbox('showPreviousPageLinkTitle', {
        text: strings.showPreviousPageTitleLabel
      });
    }

    return {
      pages: [
        {
          // header: {
          //   description: strings.propertyPaneDescription

          // },
          groups: [            
            {
              groupFields: [
                PropertyPaneToggle('hideTitle', {
                  label: strings.hideTitleFieldLabel
                }),
                PropertyPaneTextField('titleText', {
                  description: strings.titleFieldDescription,
                  disabled: this.properties.hideTitle,
                  onGetErrorMessage: this.checkToggleField,
                  value: strings.titleDefaultValue
                }),
                PropertyFieldColorPicker('titleColor', {
                  label: strings.textColor,
                  selectedColor: this.properties.titleColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'colorFieldId'
                }),
                PropertyPaneSlider('titleSize', {
                  label: strings.textSize,
                  min: 10,
                  max: 60,
                  value: this.properties.titleSize,
                  step : 2,
                  showValue: true,
                }),  
              ]
            },
            {
              groupFields: [
                PropertyPaneLabel('searchWebpartsLabel', {
                  text: strings.searchWebpartsLabel
                }),
                PropertyPaneCheckbox('searchText', {
                  text: strings.searchText,
                }),
                PropertyPaneCheckbox('searchMarkdown', {
                  text: strings.searchMarkdown
                }),
                PropertyPaneCheckbox('searchCollapsible', {
                  text: strings.searchCollapsible
                }),
              ]
            },
            {
              groupFields: [
                PropertyPaneLabel('showHeadingLevelsLabel', {
                  text: strings.showHeadingLevelsLabel
                }),
                PropertyPaneCheckbox('showHeading1', {
                  text: strings.showHeading1FieldLabel
                }),
                PropertyPaneCheckbox('showHeading2', {
                  text: strings.showHeading2FieldLabel
                }),
                PropertyPaneCheckbox('showHeading3', {
                  text: strings.showHeading3FieldLabel
                }),
                showHeading4,
                PropertyFieldColorPicker('headingColor', {
                  label: strings.textColor,
                  selectedColor: this.properties.headingColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'colorFieldId'
                }),
                PropertyPaneSlider('headingSize', {
                  label: strings.textSize,
                  min: 10,
                  max: 60,
                  value: this.properties.headingSize,
                  step : 2,
                  showValue: true,
                }),  
                PropertyPaneDropdown('listStyle', {
                  label: strings.listStyle,
                  options: [
                    { key: 'default', text: 'Default' },
                    { key: 'disc', text: 'Disc' },
                    { key: 'circle', text: 'Circle' },
                    { key: 'square', text: 'Square' },
                    { key: 'none', text: 'None' }
                  ],
                  selectedKey: "default"
                }),
              ]
            },
            {
              groupFields: [
                PropertyPaneLabel('previousPageLabel', {
                  text: strings.showPreviousPageViewLabel
                }),
                showPreviousPageLinkTitle,
                PropertyPaneCheckbox('showPreviousPageLinkAbove', {
                  text: strings.showPreviousPageAboveLabel
                }),
                PropertyPaneCheckbox('showPreviousPageLinkBelow', {
                  text: strings.showPreviousPageBelowLabel
                }),
                PropertyPaneTextField('previousPageText', {
                  label: strings.previousPageFieldLabel,
                  disabled: (!this.properties.showPreviousPageLinkTitle || this.properties.hideTitle) && !this.properties.showPreviousPageLinkAbove && !this.properties.showPreviousPageLinkBelow,
                  onGetErrorMessage: this.checkToggleField,
                  value: strings.previousPageDefaultValue
                }),
              ]
            },
            {
              groupFields: [
                PropertyPaneLabel('theme', {
                  text: strings.theme
                }),
                PropertyPaneCheckbox('verticalToRight', {
                  text: strings.verticalToRight
                }),
                PropertyPaneDropdown('wpStyle', {
                  label: strings.wpStyle,
                  options: [
                    { key: 'wpStylePlain', text: 'Plain' },
                    { key: 'wpStyleBoxed', text: 'Boxed' },
                    { key: 'wpStyleLined', text: 'Lined' },                    
                  ],
                  selectedKey: "plain"
                }),
                PropertyPaneDropdown('collapsibleState', {
                  label: strings.collapsibleState,
                  options: [
                    { key: 'noneState', text: 'None' },
                    { key: 'collapsedState', text: 'Collapsed' },
                    { key: 'expandedState', text: 'Expanded' },                    
                  ],
                  selectedKey: "noneState"
                }),
                PropertyPaneCheckbox('addScrollToTop', {
                  text: strings.addScrollToTop
                }),
                PropertyFieldColorPicker('backgroundColor', {
                  label: strings.backgroundColor,
                  selectedColor: this.properties.backgroundColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'colorFieldId',
                  
                }),
                PropertyFieldColorPicker('activeLinkBackgroundColor', {
                  label: strings.activeLinkBackgroundColor,
                  selectedColor: this.properties.activeLinkBackgroundColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'colorFieldId'
                }),
                PropertyFieldColorPicker('borderColor', {
                  label: strings.borderColor,
                  selectedColor: this.properties.borderColor,
                  onPropertyChange: this.onPropertyPaneFieldChanged,
                  properties: this.properties,
                  disabled: false,
                  debounce: 1000,
                  isHidden: false,
                  alphaSliderHidden: false,
                  style: PropertyFieldColorPickerStyle.Inline,
                  iconName: 'Precipitation',
                  key: 'colorFieldId'
                }),
                PropertyPaneSlider('borderSize', {
                  label: strings.borderSize,
                  min: 0,
                  max: 10,
                  value: this.properties.borderSize,
                  step : 1,
                  showValue: true,
                }),  
                PropertyPaneSlider('borderRoundness', {
                  label: strings.borderRoundness,
                  min: 0,
                  max: 50,
                  value: this.properties.borderRoundness,
                  step : 1,
                  showValue: true,
                }),  
                PropertyPaneToggle('enableShadow', {
                  label: strings.shadow
                }),
              ]
            },
            // {
            //   groupFields: [
            //     PropertyPaneToggle('setHeight', {
            //       label: strings.setHeightLabel
            //     }),
            //     PropertyPaneToggle('enableInnerScrolling', {
            //       label: strings.enableInnerScrollingLabel,
            //       disabled: !this.properties.setHeight
            //     }),
            //     PropertyPaneSlider('contentsHeight', {
            //       label: strings.contentsHeightLabel,
            //       min: 100,
            //       max: 800,
            //       value: this.properties.contentsHeight,
            //       step : 1,
            //       showValue: true,
            //       disabled: !this.properties.setHeight
            //     }), 
            //   ]
            // },
            {
              groupFields: [
                PropertyPaneToggle('enableStickyMode', {
                  label: strings.enableStickyModeLabel
                }),
                PropertyPaneLabel('enabldeStickyModeDescription', {
                  text: strings.enableStickyModeDescription
                }),
                PropertyPaneToggle('hideInMobileView', {
                  label: strings.hideInMobileViewLabel
                })
              ]
            },
            {
              groupFields: [       
                PropertyPaneLabel('helpTitle', {
                  text: 'Help'
                }),         
                PropertyPaneLink('linkProperty', {
                  href: 'https://pdsb1.sharepoint.com/sites/PDSBbrand/SitePages/TOC.aspx',
                  text: 'Need manuals for this web part?',
                  target: '_blank'
                })
              ]
            },
          ]
        }
      ]
    };
  }

  private checkToggleField = (value: string): string => {
    if (value === "") {
      return strings.errorToggleFieldEmpty;
    }
    else {
      return "";
    }
  }

}
