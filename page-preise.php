<?php get_header(); ?>

  <main role="main">
    <!-- section -->
    <section>

      <h1><?php the_title(); ?></h1>

    <?php if (have_posts()): while (have_posts()) : the_post(); ?>

      <!-- article -->
      <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

        <?php the_content(); ?>

        <?php

        // check if the flexible content field has rows of data
        if( have_rows('preisliste') ):

          // loop through the rows of data
          while ( have_rows('preisliste') ) : the_row();

            // check current row layout
              if( get_row_layout() == 'leistungen' ):

                $behandlungskategorie = get_sub_field('behandlungskategorie');
                $behandlungskategorie_beschreibung = get_sub_field('behandlungskategorie_beschreibung');
                $behandlungskategorie_bild = get_sub_field('behandlungskategorie_bild');

                echo '<h2>' . $behandlungskategorie . '</h2>';
                echo '<p>' . $behandlungskategorie_beschreibung . '</p>';
                echo '<img src="' . $behandlungskategorie_bild['url'] . '" />';

                // check if the nested repeater field has rows of data
                if( have_rows('behandlungen') ):

                  echo '<table class="table">';

                  // loop through the rows of data
                    while ( have_rows('behandlungen') ) : the_row();

                    $behandlung = get_sub_field('behandlung');
                    $beschreibung = get_sub_field('beschreibung');
                    $preis = get_sub_field('preis');

                    echo '<tr>';
                      echo '<td>' . $behandlung . '</td>';
                      echo '<td>' . $beschreibung . '</td>';
                      echo '<td>' . $preis . '</td>';
                    echo '</tr>';

                  endwhile;

                  echo '</table>';
                endif;
              endif;
          endwhile;

        else :

            // no layouts found

        endif;

        ?>

        <br class="clear">

        <?php edit_post_link(); ?>

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
