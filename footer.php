			<!-- footer -->
			<footer class="footer" role="contentinfo">

				<?php

				// get Page ID from Footer Page to access the values
				$page = get_page_by_title('Footer');

        // check if the flexible content field has rows of data of specific page
        if( have_rows('inhalt_footer', $page->ID) ):

          // loop through the rows of data of specific page
          while ( have_rows('inhalt_footer', $page->ID) ) : the_row();

            // check current row layout
            if( get_row_layout() == 'map' ):

              $firma = get_sub_field('firma');
              $strasse = get_sub_field('strasse');
              $hausnummer = get_sub_field('hausnummer');
              $postleitzahl = get_sub_field('postleitzahl');
              $ort = get_sub_field('ort');
              $offnungszeiten = get_sub_field('offnungszeiten');
              $telefonnummer = get_sub_field('telefonnummer');

              echo '<div>';
                echo '<h2>' . $firma . '</h2>';
                echo '<address>' .
                	$strasse . ' ' .
                	$hausnummer	. '<br>' .
                	$postleitzahl . ' ' .
                	$ort .
                '</address>';
                echo $telefonnummer;
              echo '</div>';



?>
	<div class="acf-map">

			<?php $location = get_sub_field('google_map');

			?>
			<div class="marker" data-lat="<?php echo $location['lat']; ?>" data-lng="<?php echo $location['lng']; ?>">
				<h4><?php the_sub_field('title'); ?></h4>
				<p><?php the_sub_field('description'); ?></p>
			</div>

	</div>

<?php


            endif;

          endwhile;

        else :

            // no layouts found

        endif;

        ?>

				<!-- copyright -->
				<p class="copyright">
					&copy; <?php echo date('Y'); ?> Copyright <?php bloginfo('name'); ?>. <?php _e('Powered by', 'html5blank'); ?>
					<a href="//wordpress.org" title="WordPress">WordPress</a> &amp; <a href="//html5blank.com" title="HTML5 Blank">HTML5 Blank</a>.
				</p>
				<!-- /copyright -->

			</footer>
			<!-- /footer -->

		</div>
		<!-- /wrapper -->

		<?php wp_footer(); ?>

		<!-- analytics -->
		<script>
		(function(f,i,r,e,s,h,l){i['GoogleAnalyticsObject']=s;f[s]=f[s]||function(){
		(f[s].q=f[s].q||[]).push(arguments)},f[s].l=1*new Date();h=i.createElement(r),
		l=i.getElementsByTagName(r)[0];h.async=1;h.src=e;l.parentNode.insertBefore(h,l)
		})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
		ga('create', 'UA-XXXXXXXX-XX', 'yourdomain.com');
		ga('send', 'pageview');
		</script>

	</body>
</html>
