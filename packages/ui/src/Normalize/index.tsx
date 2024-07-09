import { createGlobalStyle } from 'styled-components';
import cssContents from './normalize.css?raw';

export const Normalize = createGlobalStyle`${cssContents}`;
