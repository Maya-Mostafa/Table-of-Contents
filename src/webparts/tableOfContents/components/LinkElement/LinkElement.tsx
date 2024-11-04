import * as React from 'react';
import {LinkElementProps} from './LinkElementProps';
import styles from '../TableOfContents.module.scss';
import { Icon } from '@fluentui/react';

export default function LinkElement(props: LinkElementProps){

    const [isCollapse, setIsCollapse] = React.useState(props.collapsibleState === "collapsedState");

    const clickHandler = () => {
        if(props.link.childNodes.length > 0 && props.collapsibleState !== "noneState") setIsCollapse(!isCollapse);
        props.clickHandler();
    };

    return(
        <li className={props.link.childNodes.length > 0 ? styles.linkHasChild : styles.linkNoChild}>
            <a 
                className={`${props.activeClass} ${isCollapse ? styles.collapseChild : styles.expandChild}`} 
                onClick={clickHandler}
                href={'#' + props.link.element.id}>
                    {props.link.childNodes.length > 0 && props.collapsibleState === "expandedState" && <span className={styles.colExpIcon}><Icon iconName='ChevronDown' /></span>}
                    {props.link.childNodes.length > 0 && props.collapsibleState === "collapsedState" && <span className={styles.colExpIcon}><Icon iconName='ChevronRight' /></span>}
                    {props.link.element.innerText}
            </a>
            {props.children}
        </li>
    );
}