import { FC } from 'react';
import styles from './styles.module.css';

export const Hero: FC = () => {
  return (
    <section className={styles.hero}>
      <h1>Penumbra Web</h1>
      <p>A web toolkit for Penumbra blockchain</p>
      <a href="/docs">Get started</a>
    </section>
  )
};
