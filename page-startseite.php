<?php get_header(); ?>

  <main role="main">
    <!-- section -->
    <section>

    <?php if (have_posts()): while (have_posts()) : the_post(); ?>

      <!-- article -->
      <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

        <?php

        // check if the flexible content field has rows of data
        if( have_rows('inhalt') ):

          // loop through the rows of data
          while ( have_rows('inhalt') ) : the_row();

            // check current row layout
              if( get_row_layout() == 'titelbild_block' ):

                $titelbild_headline = get_sub_field('titelbild_headline');
                $titelbild_beschreibung = get_sub_field('titelbild_beschreibung');
                $titelbild = get_sub_field('titelbild');

                // echo '<pre>';
                // echo var_dump($titelbild);
                // echo '</pre>';

                echo '<div class="hero-image" style="background-image: url(' . $titelbild['url'] . ');">';
                echo '<div class="hero-textbox">';
                  echo '<h2>' . $titelbild_headline . '</h2>';
                  echo '<p>' . $titelbild_beschreibung . '</p>';
                  echo '<button class="btn btn-outline-primary btn-lg" type="submit">Gleich Termin vereinbaren!</button>';
                echo '</div>';
                echo '</div>';

              endif;

          endwhile;

        else :

            // no layouts found

        endif;

        ?>

        <?php the_content(); ?>

        <?php

        // check if the flexible content field has rows of data
        if( have_rows('inhalt') ):

          // loop through the rows of data
          while ( have_rows('inhalt') ) : the_row();

            // check current row layout
              if( get_row_layout() == 'textblock' ):

                $textblock_headline = get_sub_field('textblock_headline');
                $textblock_beschreibung = get_sub_field('textblock_beschreibung');
                $textblock_bild = get_sub_field('textblock_bild');
                $ausrichtung_bild = get_sub_field('ausrichtung_bild');

                echo '<div class="textblock">';
                  echo '<img src="' . $textblock_bild['sizes']['frontpage-thumbnail'] . '" />';
                  echo '<div class="textblock-content">';
                    echo '<h2>' . $textblock_headline . '</h2>';
                    echo '<p>' . $textblock_beschreibung . '</p>';
                  echo '</div>';

                                  echo '<div class="divider"></div>';
                echo '</div>';



                // echo '<pre>';
                //   var_dump($ausrichtung_bild);
                // echo '</pre>';

              endif;

          endwhile;

        else :

            // no layouts found

        endif;

        ?>

      </article>
      <!-- /article -->

    <?php endwhile; ?>

    <?php else: ?>

      <!-- article -->
      <article>

        <h2><?php _e( 'Sorry, nothing to display.', 'html5blank' ); ?></h2>

      </article>
      <!-- /article -->

    <?php endif; ?>

    </section>
    <!-- /section -->
  </main>

<?php get_footer(); ?>
