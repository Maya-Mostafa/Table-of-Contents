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

    const iconClickHanlder = (e: any) => {
        e.preventDefault();
    }

    return(
        <li className={props.link.childNodes.length > 0 ? styles.linkHasChild : styles.linkNoChild}>
            <a 
                className={`${props.activeClass} ${isCollapse ? styles.collapseChild : styles.expandChild}`} 
                style={{backgroundColor: props.activeClass !== '' ? props.activeLinkColor : 'inherit'}}
                onClick={clickHandler}
                href={'#' + props.link.element.id}>
                    {props.link.childNodes.length > 0 && !isCollapse && <span onClick={iconClickHanlder} className={styles.colExpIcon}><Icon iconName='ChevronDown' /></span>}
                    {props.link.childNodes.length > 0 && isCollapse && <span onClick={iconClickHanlder} className={styles.colExpIcon}><Icon iconName='ChevronRight' /></span>}
                    {props.link.childNodes.length == 0 && <span> </span>}
                    <span>{props.link.element.innerText}</span>
            </a>
            {props.children}
        </li>
    );
}