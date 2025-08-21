# Generated manually to remove unique constraint

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('attendance', '0002_alter_attendance_unique_together'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='attendance',
            unique_together=set(),  # Remove the unique constraint
        ),
    ]
