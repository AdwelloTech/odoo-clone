from django.core.management.base import BaseCommand
from django.conf import settings
from employees.models import Employee
import os


class Command(BaseCommand):
    help = 'Clean up invalid profile image references in the database'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be cleaned up without making changes',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('DRY RUN MODE - No changes will be made')
            )

        # Get all employees with profile images
        employees_with_images = Employee.objects.exclude(profile_image='')
        
        if not employees_with_images:
            self.stdout.write(
                self.style.SUCCESS('No employees with profile images found.')
            )
            return

        cleaned_count = 0
        valid_count = 0

        for employee in employees_with_images:
            # Check if the actual file exists
            if employee.profile_image:
                image_path = os.path.join(settings.MEDIA_ROOT, str(employee.profile_image))
                
                if not os.path.exists(image_path):
                    self.stdout.write(
                        self.style.WARNING(
                            f'Invalid image reference for {employee.full_name}: {employee.profile_image}'
                        )
                    )
                    
                    if not dry_run:
                        employee.profile_image = ''
                        employee.save()
                        self.stdout.write(
                            self.style.SUCCESS(f'✓ Cleaned up {employee.full_name}')
                        )
                    
                    cleaned_count += 1
                else:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Valid image for {employee.full_name}: {employee.profile_image}'
                        )
                    )
                    valid_count += 1

        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(f'Valid images: {valid_count}')
        self.stdout.write(f'Invalid images: {cleaned_count}')
        
        if dry_run and cleaned_count > 0:
            self.stdout.write(
                self.style.WARNING(
                    f'\nRun without --dry-run to clean up {cleaned_count} invalid references'
                )
            )
        elif cleaned_count > 0:
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n✓ Successfully cleaned up {cleaned_count} invalid references'
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('\n✓ No cleanup needed - all images are valid!')
            )
